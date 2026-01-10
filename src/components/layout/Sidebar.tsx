"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  Download,
  Upload,
  Settings,
  User,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn, formatDate, downloadAsFile } from "@/lib/utils";
import { useAppStore } from "@/store";
import { usePuter } from "@/hooks/usePuter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";

export function Sidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    exportAllConversations,
    importConversations,
    sidebarOpen,
    toggleSidebar,
    toggleSettings,
  } = useAppStore();

  const { isSignedIn, signIn, signOut, username } = usePuter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");

  // Start editing conversation title
  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  // Save edited title
  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // Handle export
  const handleExport = () => {
    const json = exportAllConversations();
    downloadAsFile(json, "puterllm-conversations.json", "application/json");
  };

  // Handle import
  const handleImport = () => {
    if (importJson.trim()) {
      try {
        importConversations(importJson);
        setImportJson("");
        setShowImportModal(false);
      } catch (error) {
        console.error("Import failed:", error);
      }
    }
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = new Date(conv.updatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    let group: string;
    if (date.toDateString() === today.toDateString()) {
      group = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = "Yesterday";
    } else if (date > lastWeek) {
      group = "This Week";
    } else {
      group = "Older";
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(conv);
    return groups;
  }, {} as Record<string, typeof conversations>);

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-[var(--background-secondary)] border-r border-[var(--glass-border)] flex flex-col z-30"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--glass-border)]">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold neon-text-cyan">PuterLLM</h1>
                <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="neon"
                className="w-full"
                onClick={() => createConversation()}
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(groupedConversations).map(([group, convs]) => (
                <div key={group} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-[var(--foreground-muted)]">
                    <Clock className="w-3 h-3" />
                    {group}
                  </div>
                  {convs.map((conv) => (
                    <motion.div
                      key={conv.id}
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                        conv.id === currentConversationId
                          ? "bg-[var(--neon-purple)]/10 border border-[var(--neon-purple)]/30"
                          : "hover:bg-[var(--background-tertiary)]"
                      )}
                      onClick={() =>
                        editingId !== conv.id && selectConversation(conv.id)
                      }
                    >
                      <MessageSquare
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          conv.id === currentConversationId
                            ? "text-[var(--neon-purple)]"
                            : "text-[var(--foreground-muted)]"
                        )}
                      />

                      {editingId === conv.id ? (
                        <div className="flex-1 flex items-center gap-1">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-7 text-sm"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={saveEdit}
                            className="h-7 w-7"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={cancelEdit}
                            className="h-7 w-7"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm truncate">
                            {conv.title}
                          </span>
                          <div className="hidden group-hover:flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(conv.id, conv.title);
                              }}
                              className="h-6 w-6"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conv.id);
                              }}
                              className="h-6 w-6 text-[var(--neon-red)]"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              ))}

              {conversations.length === 0 && (
                <div className="text-center py-8 text-[var(--foreground-muted)] text-sm">
                  No conversations yet.
                  <br />
                  Start a new chat!
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--glass-border)] space-y-2">
              {/* Import/Export */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  disabled={conversations.length === 0}
                  className="flex-1"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImportModal(true)}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              </div>

              {/* User/Auth */}
              <div className="flex items-center justify-between pt-2">
                {isSignedIn ? (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--neon-cyan)]" />
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {username}
                    </span>
                    <Button variant="ghost" size="icon-sm" onClick={signOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={signIn}>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                )}

                <Button variant="ghost" size="icon-sm" onClick={toggleSettings}>
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button when closed */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed left-4 top-4 z-30 p-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] hover:border-[var(--neon-cyan)] transition-colors"
          onClick={toggleSidebar}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Conversations"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--foreground-muted)]">
            Paste your exported conversations JSON below:
          </p>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='[{"id": "...", "title": "...", ...}]'
            className="w-full h-48 p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-sm font-mono resize-none focus:outline-none focus:border-[var(--neon-cyan)]"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="neon"
              onClick={handleImport}
              disabled={!importJson.trim()}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
