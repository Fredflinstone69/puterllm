"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
        "relative flex flex-col p-4 rounded-xl border transition-all duration-200 text-left min-w-[200px] h-[140px]",
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Carousel navigation
  const visibleCount = 4;
  const maxIndex = Math.max(0, filteredModels.length - visibleCount);

  const scrollCarousel = (direction: "left" | "right") => {
    setCarouselIndex((prev) => {
      if (direction === "left") return Math.max(0, prev - 1);
      return Math.min(maxIndex, prev + 1);
    });
  };

  // Auto-scroll to selected model
  useEffect(() => {
    if (selectedModel) {
      const index = filteredModels.findIndex((m) => m.id === selectedModel);
      if (index >= 0) {
        const newIndex = Math.min(maxIndex, Math.max(0, index - 1));
        setCarouselIndex(newIndex);
      }
    }
  }, [selectedModel, filteredModels, maxIndex]);

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

      {/* Model Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        <Button
          variant="glass"
          size="icon-sm"
          onClick={() => scrollCarousel("left")}
          disabled={carouselIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="glass"
          size="icon-sm"
          onClick={() => scrollCarousel("right")}
          disabled={carouselIndex >= maxIndex}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Carousel Container */}
        <div className="overflow-hidden px-2" ref={carouselRef}>
          <motion.div
            className="flex gap-3"
            animate={{ x: -carouselIndex * 212 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={model.id === selectedModel}
                onClick={() => selectModel(model.id)}
              />
            ))}
          </motion.div>
        </div>

        {/* Carousel Dots */}
        {filteredModels.length > visibleCount && (
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: Math.ceil(filteredModels.length / visibleCount) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(Math.min(maxIndex, i * visibleCount))}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  Math.floor(carouselIndex / visibleCount) === i
                    ? "bg-[var(--neon-cyan)] w-6"
                    : "bg-[var(--foreground-muted)]/30"
                )}
              />
            ))}
          </div>
        )}
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
