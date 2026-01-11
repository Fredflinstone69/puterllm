"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Zap,
  Brain,
  Code,
  FileText,
  Filter,
  Star,
  Sparkles,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import type { AIModel } from "@/types/puter";

interface ModelCardProps {
  model: AIModel;
  isSelected: boolean;
  onClick: () => void;
}

function ModelCard({ model, isSelected, onClick }: ModelCardProps) {
  const getModelIcon = () => {
    const id = model.id.toLowerCase();
    if (id.includes("vision") || id.includes("4o") || id.includes("gemini")) {
      return <Eye className="w-4 h-4" />;
    }
    if (id.includes("code") || id.includes("codestral") || id.includes("deepseek")) {
      return <Code className="w-4 h-4" />;
    }
    if (id.includes("claude") || id.includes("opus") || id.includes("sonnet")) {
      return <Brain className="w-4 h-4" />;
    }
    if (id.includes("gpt") || id.includes("o1") || id.includes("o3")) {
      return <Sparkles className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getModelStrengths = () => {
    const id = model.id.toLowerCase();
    const strengths: string[] = [];
    
    if (id.includes("vision") || id.includes("4o") || model.supports_vision) {
      strengths.push("Vision");
    }
    if (id.includes("code") || id.includes("codestral") || id.includes("deepseek-coder")) {
      strengths.push("Coding");
    }
    if (id.includes("claude") || id.includes("o1") || id.includes("o3")) {
      strengths.push("Reasoning");
    }
    if (id.includes("flash") || id.includes("haiku") || id.includes("mini")) {
      strengths.push("Fast");
    }
    if (id.includes("opus") || id.includes("sonnet") || id.includes("pro")) {
      strengths.push("Quality");
    }
    
    return strengths.slice(0, 2);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col p-4 rounded-xl border transition-all duration-200 text-left min-w-[200px] h-[140px] flex-shrink-0",
        isSelected
          ? "bg-[var(--neon-cyan)]/10 border-[var(--neon-cyan)] shadow-[0_0_20px_rgba(0,255,255,0.2)]"
          : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--neon-purple)]/50"
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Star className="w-4 h-4 text-[var(--neon-cyan)] fill-[var(--neon-cyan)]" />
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "p-1.5 rounded-lg",
          isSelected ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]" : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
        )}>
          {getModelIcon()}
        </span>
        <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">
          {model.provider || "AI"}
        </span>
      </div>
      
      <h3 className={cn(
        "text-sm font-medium truncate mb-2",
        isSelected ? "text-[var(--neon-cyan)]" : "text-[var(--foreground)]"
      )}>
        {model.name || model.id}
      </h3>
      
      <div className="flex items-center gap-2 mt-auto">
        {model.context_window && (
          <Tooltip content="Context Window">
            <Badge variant="outline" className="text-[10px]">
              {formatNumber(model.context_window)} ctx
            </Badge>
          </Tooltip>
        )}
        {getModelStrengths().map((strength) => (
          <Badge key={strength} variant={isSelected ? "cyan" : "default"} className="text-[10px]">
            {strength}
          </Badge>
        ))}
      </div>
    </motion.button>
  );
}

export function ModelSelector() {
  const {
    models,
    selectedModel,
    selectModel,
    modelSearchQuery,
    setModelSearchQuery,
    modelFilter,
    setModelFilter,
  } = useAppStore();

  const [showFilters, setShowFilters] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isUserSelection = useRef(false);
  const hasInitiallyScrolled = useRef(false);

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let result = [...models];

    // Apply search filter
    if (modelSearchQuery) {
      const query = modelSearchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.id.toLowerCase().includes(query) ||
          m.name?.toLowerCase().includes(query) ||
          m.provider?.toLowerCase().includes(query)
      );
    }

    // Apply vision filter
    if (modelFilter.supportsVision !== null) {
      result = result.filter((m) => m.supports_vision === modelFilter.supportsVision);
    }

    // Apply provider filter
    if (modelFilter.provider) {
      result = result.filter(
        (m) => m.provider?.toLowerCase() === modelFilter.provider?.toLowerCase()
      );
    }

    // Apply context window filter
    if (modelFilter.minContextWindow) {
      result = result.filter(
        (m) => (m.context_window || 0) >= modelFilter.minContextWindow!
      );
    }

    // Sort by quality/popularity heuristic
    result.sort((a, b) => {
      // Prioritize certain model families
      const getPriority = (id: string) => {
        id = id.toLowerCase();
        if (id.includes("gpt-4o") || id.includes("claude-3.5") || id.includes("claude-3-5")) return 10;
        if (id.includes("o1") || id.includes("o3")) return 9;
        if (id.includes("gpt-4") || id.includes("claude-3")) return 8;
        if (id.includes("gemini-pro") || id.includes("gemini-2")) return 7;
        if (id.includes("llama-3") || id.includes("mistral")) return 6;
        if (id.includes("deepseek")) return 5;
        return 1;
      };
      return getPriority(b.id) - getPriority(a.id);
    });

    return result;
  }, [models, modelSearchQuery, modelFilter]);

  // Get unique providers for filter
  const providers = useMemo(() => {
    const providerSet = new Set(models.map((m) => m.provider).filter(Boolean));
    return Array.from(providerSet) as string[];
  }, [models]);

  // Check scroll state
  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, []);

  // Update scroll state on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateScrollState);
    updateScrollState();

    return () => container.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState, filteredModels]);

  // Scroll navigation
  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 424; // ~2 cards worth
    const targetScroll = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, []);

  // Mouse drag scrolling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftStart(container.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    container.scrollLeft = scrollLeftStart - walk;
  }, [isDragging, startX, scrollLeftStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Auto-scroll to selected model only on initial mount
  useEffect(() => {
    // Skip if user just clicked a model (they know where it is)
    if (isUserSelection.current) {
      isUserSelection.current = false;
      return;
    }
    
    // Only auto-scroll on initial mount, not on subsequent selections
    if (hasInitiallyScrolled.current) {
      return;
    }
    
    if (selectedModel && scrollContainerRef.current) {
      const index = filteredModels.findIndex((m) => m.id === selectedModel);
      if (index >= 0) {
        const cardWidth = 212; // 200px + 12px gap
        const container = scrollContainerRef.current;
        const targetScroll = Math.max(0, index * cardWidth - container.clientWidth / 2 + cardWidth / 2);
        container.scrollTo({
          left: targetScroll,
          behavior: "smooth",
        });
        hasInitiallyScrolled.current = true;
      }
    }
  }, [selectedModel, filteredModels]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            value={modelSearchQuery}
            onChange={(e) => setModelSearchQuery(e.target.value)}
            placeholder="Search models..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          variant={showFilters ? "neon" : "glass"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)]">
              <Button
                variant={modelFilter.supportsVision ? "neon" : "ghost"}
                size="sm"
                onClick={() =>
                  setModelFilter({
                    supportsVision: modelFilter.supportsVision ? null : true,
                  })
                }
              >
                <Eye className="w-3 h-3" />
                Vision
              </Button>
              
              {providers.slice(0, 6).map((provider) => (
                <Button
                  key={provider}
                  variant={modelFilter.provider === provider ? "neon" : "ghost"}
                  size="sm"
                  onClick={() =>
                    setModelFilter({
                      provider: modelFilter.provider === provider ? null : provider,
                    })
                  }
                >
                  {provider}
                </Button>
              ))}

              <Button
                variant={modelFilter.minContextWindow ? "neon" : "ghost"}
                size="sm"
                onClick={() =>
                  setModelFilter({
                    minContextWindow: modelFilter.minContextWindow ? null : 32000,
                  })
                }
              >
                <Zap className="w-3 h-3" />
                32K+ Context
              </Button>

              {(modelFilter.supportsVision !== null ||
                modelFilter.provider ||
                modelFilter.minContextWindow) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setModelFilter({
                      supportsVision: null,
                      provider: null,
                      minContextWindow: null,
                    })
                  }
                  className="text-[var(--neon-red)]"
                >
                  Clear
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Scroll Container */}
      <div className="relative group">
        {/* Left Navigation Button */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 z-10 flex items-center"
            >
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none" />
              <Button
                variant="glass"
                size="icon-sm"
                onClick={() => scroll("left")}
                className="relative ml-1 shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Navigation Button */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 z-10 flex items-center"
            >
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
              <Button
                variant="glass"
                size="icon-sm"
                onClick={() => scroll("right")}
                className="relative mr-1 shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-3 overflow-x-auto pb-4 px-1 model-selector-scroll",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          )}
          style={{
            scrollBehavior: isDragging ? "auto" : "smooth",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={model.id === selectedModel}
              onClick={() => {
                if (!isDragging) {
                  isUserSelection.current = true;
                  selectModel(model.id);
                }
              }}
            />
          ))}
        </div>

        {/* Scroll hint text */}
        <div className="text-center text-xs text-[var(--foreground-muted)]/60 mt-2">
          Scroll or drag to browse models
        </div>
      </div>

      {/* Model Count */}
      <div className="text-center text-sm text-[var(--foreground-muted)]">
        {filteredModels.length} models available
        {selectedModel && (
          <span className="text-[var(--neon-cyan)]">
            {" "} - Selected: {filteredModels.find((m) => m.id === selectedModel)?.name || selectedModel}
          </span>
        )}
      </div>
    </div>
  );
}
