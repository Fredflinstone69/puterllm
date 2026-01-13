"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  Wand2,
  Sparkles,
  Loader2,
  Mic,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, getPromptPrefixForDepth } from "@/store";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Badge } from "@/components/ui/Badge";

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
  onImageGenerate?: (prompt: string) => void;
  onStop?: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onImageGenerate,
  onStop,
  isGenerating,
  disabled,
}: ChatInputProps) {
  const {
    inputText,
    setInputText,
    pendingImage,
    setPendingImage,
    parameters,
    toggleTemplatePanel,
    selectedModel,
  } = useAppStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle send
  const handleSend = useCallback(() => {
    if (!inputText.trim() && !pendingImage) return;
    if (isGenerating || disabled) return;

    // Add prompt prefix based on thinking depth
    const prefix = getPromptPrefixForDepth(parameters.thinkingDepth);
    const finalMessage = prefix + inputText;

    onSend(finalMessage, pendingImage || undefined);
    setInputText("");
    setPendingImage(null);
  }, [inputText, pendingImage, isGenerating, disabled, parameters.thinkingDepth, onSend, setInputText, setPendingImage]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
    // Enter without shift to send (optional)
    // if (e.key === "Enter" && !e.shiftKey) {
    //   e.preventDefault();
    //   handleSend();
    // }
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setShowImageOptions(false);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
        break;
      }
    }
  };

  // Handle image generation
  const handleGenerateImage = () => {
    if (!inputText.trim() || !onImageGenerate) return;
    onImageGenerate(inputText);
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl bg-[var(--glass-bg)] border transition-all duration-200",
        isDragging
          ? "border-[var(--neon-cyan)] shadow-[0_0_20px_rgba(0,255,255,0.2)]"
          : "border-[var(--glass-border)]",
        disabled && "opacity-50 pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl bg-[var(--neon-cyan)]/10 flex items-center justify-center z-10"
          >
            <div className="text-[var(--neon-cyan)] flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Drop image here
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending image preview */}
      <AnimatePresence>
        {pendingImage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="relative inline-block">
              <img
                src={pendingImage}
                alt="Pending upload"
                className="h-24 w-auto rounded-lg border border-[var(--glass-border)]"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPendingImage(null)}
                className="absolute -top-2 -right-2 bg-[var(--background)] rounded-full border border-[var(--glass-border)]"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-3">
        {/* Action buttons */}
        <div className="flex gap-1">
          {/* Image upload */}
          <div className="relative">
            <Tooltip content="Add image">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImageOptions(!showImageOptions)}
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            </Tooltip>

            <AnimatePresence>
              {showImageOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 p-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] shadow-lg"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full justify-start gap-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    Upload Image
                  </Button>
                  {onImageGenerate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateImage}
                      disabled={!inputText.trim()}
                      className="w-full justify-start gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Image
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Template button */}
          <Tooltip content="Prompt templates">
            <Button variant="ghost" size="icon" onClick={toggleTemplatePanel}>
              <Wand2 className="w-5 h-5" />
            </Button>
          </Tooltip>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type your message... (Ctrl+Enter to send)"
            rows={1}
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] resize-none transition-all duration-200",
              "focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_10px_rgba(0,255,255,0.1)]",
              "min-h-[48px] max-h-[200px]"
            )}
          />

          {/* Character count */}
          {inputText.length > 1000 && (
            <div className="absolute bottom-2 right-2 text-xs text-[var(--foreground-muted)]">
              {inputText.length.toLocaleString()}
            </div>
          )}
        </div>

        {/* Send / Stop button */}
        {isGenerating ? (
          <Tooltip content="Stop generating">
            <Button
              id="stop-button"
              variant="destructive"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[DEBUG] Stop button clicked");
                onStop?.();
              }}
              className="bg-[var(--neon-red)] hover:bg-[var(--neon-red)]/80"
            >
              <Square className="w-5 h-5 fill-current" />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content="Send (Ctrl+Enter)">
            <Button
              id="send-button"
              variant="neon"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[DEBUG] Send button clicked");
                handleSend();
              }}
              disabled={(!inputText.trim() && !pendingImage)}
            >
              <Send className="w-5 h-5" />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-3 text-xs text-[var(--foreground-muted)]">
        <div className="flex items-center gap-3">
          {selectedModel && (
            <span>
              Model: <span className="text-[var(--neon-cyan)]">{selectedModel}</span>
            </span>
          )}
          <span>
            Depth: <span className="text-[var(--neon-purple)]">{parameters.thinkingDepth}/10</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            Ctrl+Enter to send
          </Badge>
        </div>
      </div>
    </div>
  );
}
