"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { usePuter } from "@/hooks/usePuter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Header() {
  const { sidebarOpen, toggleSidebar, selectedModel, models } = useAppStore();
  const { isReady, isLoading } = usePuter();

  const selectedModelInfo = models.find((m) => m.id === selectedModel);

  return (
    <header className="h-16 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl sticky top-0 z-20">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] p-[2px]">
                <div className="w-full h-full rounded-xl bg-[var(--background)] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[var(--neon-cyan)]" />
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] opacity-30 blur-lg -z-10" />
            </div>

            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                PuterLLM
              </h1>
              <p className="text-xs text-[var(--foreground-muted)]">
                Zero-Config AI Platform
              </p>
            </div>
          </motion.div>
        </div>

        {/* Center - Status */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <Badge variant="yellow" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--neon-yellow)] animate-pulse" />
              Loading Puter.js...
            </Badge>
          ) : isReady ? (
            <Badge variant="green" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--neon-green)]" />
              Connected
            </Badge>
          ) : (
            <Badge variant="red" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--neon-red)]" />
              Disconnected
            </Badge>
          )}

          {selectedModelInfo && (
            <Badge variant="cyan" className="gap-1">
              <Zap className="w-3 h-3" />
              {selectedModelInfo.name || selectedModelInfo.id}
            </Badge>
          )}

          <Badge variant="outline" className="gap-1">
            {models.length} models available
          </Badge>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Model count on mobile */}
          <div className="md:hidden">
            <Badge variant="outline">
              {models.length} models
            </Badge>
          </div>

          {/* PWA Install hint */}
          <div className="hidden lg:block text-xs text-[var(--foreground-muted)]">
            Press Ctrl+Shift+A to install
          </div>
        </div>
      </div>
    </header>
  );
}
