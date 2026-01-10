"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  RefreshCw,
  Github,
  ExternalLink,
  Info,
} from "lucide-react";
import { useAppStore } from "@/store";
import { usePuter } from "@/hooks/usePuter";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";

export function SettingsModal() {
  const {
    settingsOpen,
    toggleSettings,
    conversations,
    models,
    fallbackModels,
    addFallbackModel,
    removeFallbackModel,
    selectedModel,
  } = useAppStore();

  const { isReady, isSignedIn, username, loadModels, error } = usePuter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshModels = async () => {
    setIsRefreshing(true);
    try {
      const newModels = await loadModels();
      useAppStore.getState().setModels(newModels);
    } catch (err) {
      console.error("Failed to refresh models:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Modal
      isOpen={settingsOpen}
      onClose={toggleSettings}
      title="Settings"
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">
            Status
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">
                Puter.js
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isReady ? "bg-[var(--neon-green)]" : "bg-[var(--neon-red)]"
                  }`}
                />
                <span className="text-sm">
                  {isReady ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">
                Account
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSignedIn ? "bg-[var(--neon-cyan)]" : "bg-[var(--foreground-muted)]"
                  }`}
                />
                <span className="text-sm">
                  {isSignedIn ? username : "Anonymous"}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">
                Models Available
              </div>
              <div className="text-lg font-semibold text-[var(--neon-cyan)]">
                {models.length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">
                Conversations
              </div>
              <div className="text-lg font-semibold text-[var(--neon-purple)]">
                {conversations.length}
              </div>
            </div>
          </div>
        </section>

        {/* Model Management */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)]">
              Model Management
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshModels}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Fallback Models */}
          <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
            <div className="text-xs text-[var(--foreground-muted)] mb-2">
              Fallback Models (used if primary fails)
            </div>
            <div className="flex flex-wrap gap-2">
              {fallbackModels.map((modelId) => (
                <Badge
                  key={modelId}
                  variant="cyan"
                  className="cursor-pointer"
                  onClick={() => removeFallbackModel(modelId)}
                >
                  {modelId}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {fallbackModels.length === 0 && (
                <span className="text-xs text-[var(--foreground-muted)]">
                  No fallback models configured
                </span>
              )}
            </div>
            {selectedModel && !fallbackModels.includes(selectedModel) && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  // Add a common fallback
                  const commonFallbacks = [
                    "gpt-4o-mini",
                    "claude-3-haiku",
                    "gemini-1.5-flash",
                  ];
                  const available = models
                    .filter(
                      (m) =>
                        commonFallbacks.some((f) =>
                          m.id.toLowerCase().includes(f)
                        ) && !fallbackModels.includes(m.id)
                    )
                    .slice(0, 1);
                  if (available.length > 0) {
                    addFallbackModel(available[0].id);
                  }
                }}
              >
                Add Recommended Fallback
              </Button>
            )}
          </div>
        </section>

        {/* Data Management */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">
            Data Management
          </h3>
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                const data = {
                  conversations: useAppStore.getState().conversations,
                  templates: useAppStore
                    .getState()
                    .templates.filter((t) => t.isCustom),
                  parameters: useAppStore.getState().parameters,
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "puterllm-backup.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4" />
              Export All Data
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to clear all local data? This cannot be undone."
                  )
                ) {
                  localStorage.removeItem("puterllm-storage");
                  window.location.reload();
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">
            About
          </h3>
          <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] p-[2px]">
                <div className="w-full h-full rounded-xl bg-[var(--background-secondary)] flex items-center justify-center text-[var(--neon-cyan)] font-bold">
                  P
                </div>
              </div>
              <div>
                <h4 className="font-semibold">PuterLLM</h4>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Zero-Config LLM Interaction Platform
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] mb-3">
              Access 100+ AI models instantly with no API keys or sign-ups
              required. Built with Puter.js for seamless cloud AI access.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("https://puter.com", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Puter.com
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open("https://github.com/puter/puter", "_blank")
                }
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </div>
          </div>
        </section>

        {/* Error display */}
        {error && (
          <div className="p-3 rounded-lg bg-[var(--neon-red)]/10 border border-[var(--neon-red)]/30 text-[var(--neon-red)] text-sm">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
