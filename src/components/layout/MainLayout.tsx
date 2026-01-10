"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { usePuter } from "@/hooks/usePuter";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ModelSelector } from "@/components/models/ModelSelector";
import { ParameterControls } from "@/components/settings/ParameterControls";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { TemplatePanel } from "@/components/templates/TemplatePanel";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { LoadingScreen } from "./LoadingScreen";

export function MainLayout() {
  const { sidebarOpen, templatePanelOpen, setModels } = useAppStore();
  const { isReady, isLoading, loadModels, error } = usePuter();

  // Load models when Puter.js is ready
  useEffect(() => {
    if (isReady) {
      loadModels().then((models) => {
        setModels(models);
      }).catch(console.error);
    }
  }, [isReady, loadModels, setModels]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+T - Toggle template panel
      if (e.ctrlKey && e.shiftKey && e.key === "T") {
        e.preventDefault();
        useAppStore.getState().toggleTemplatePanel();
      }
      // Ctrl+Shift+S - Toggle settings
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        useAppStore.getState().toggleSettings();
      }
      // Ctrl+Shift+N - New conversation
      if (e.ctrlKey && e.shiftKey && e.key === "N") {
        e.preventDefault();
        useAppStore.getState().createConversation();
      }
      // Ctrl+B - Toggle sidebar
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        useAppStore.getState().toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show loading screen while Puter.js initializes
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] cyber-grid gradient-mesh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-72" : "ml-0",
          templatePanelOpen ? "mr-96" : "mr-0"
        )}
      >
        {/* Header */}
        <Header />

        {/* Content Grid */}
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Model Selector & Parameters */}
            <div className="lg:col-span-1 space-y-6">
              {/* Model Selector */}
              <div className="p-4 rounded-xl glass">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--neon-cyan)]" />
                  Select Model
                </h2>
                <ModelSelector />
              </div>

              {/* Parameter Controls */}
              <div className="p-4 rounded-xl glass">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--neon-purple)]" />
                  Parameters
                </h2>
                <ParameterControls />
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 rounded-xl glass">
                <h3 className="text-sm font-medium mb-3 text-[var(--foreground-muted)]">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { key: "Ctrl+Enter", desc: "Send message" },
                    { key: "Ctrl+B", desc: "Toggle sidebar" },
                    { key: "Ctrl+Shift+T", desc: "Toggle templates" },
                    { key: "Ctrl+Shift+S", desc: "Open settings" },
                    { key: "Ctrl+Shift+N", desc: "New conversation" },
                  ].map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-[var(--foreground-muted)]">
                        {shortcut.desc}
                      </span>
                      <kbd className="px-2 py-1 rounded bg-[var(--background-secondary)] border border-[var(--glass-border)] text-[var(--neon-cyan)]">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Chat */}
            <div className="lg:col-span-2">
              <div className="h-[calc(100vh-8rem)] rounded-xl glass overflow-hidden">
                <ChatContainer />
              </div>
            </div>
          </div>
        </div>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg bg-[var(--neon-red)]/20 border border-[var(--neon-red)]/50 text-[var(--neon-red)]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Panel */}
      <AnimatePresence>
        {templatePanelOpen && <TemplatePanel />}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}
