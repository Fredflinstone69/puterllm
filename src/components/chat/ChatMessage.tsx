"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bot,
  Copy,
  Check,
  Volume2,
  GitBranch,
  Trash2,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import { cn, copyToClipboard, formatTimestamp } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Badge } from "@/components/ui/Badge";
import type { Message } from "@/store";

interface ChatMessageProps {
  message: Message;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onBranch?: () => void;
  onSpeak?: () => void;
  isStreaming?: boolean;
}

// Simple markdown parser
function parseMarkdown(content: string): string {
  let html = content;

  // Code blocks with language
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || "plaintext";
    let highlighted = code;
    try {
      if (Prism.languages[language]) {
        highlighted = Prism.highlight(code, Prism.languages[language], language);
      }
    } catch {
      // Fallback to plain code
    }
    return `<div class="code-block my-3"><div class="flex items-center justify-between px-3 py-2 bg-[var(--background-tertiary)] border-b border-[var(--glass-border)] text-xs text-[var(--foreground-muted)]"><span>${language}</span><button class="copy-code-btn hover:text-[var(--neon-cyan)] transition-colors" data-code="${encodeURIComponent(code)}">Copy</button></div><pre class="p-3 overflow-x-auto"><code class="language-${language}">${highlighted}</code></pre></div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-[var(--background-secondary)] px-1.5 py-0.5 rounded text-[var(--neon-pink)] text-sm">$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Headings
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-[var(--neon-cyan)] mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-[var(--neon-cyan)] mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-[var(--neon-cyan)] mt-4 mb-2">$1</h1>');

  // Lists
  html = html.replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-3 border-[var(--neon-purple)] pl-3 my-2 text-[var(--foreground-muted)] italic">$1</blockquote>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--neon-cyan)] hover:underline">$1</a>');

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, "</p><p class='my-2'>");

  // Single newlines (within paragraphs)
  html = html.replace(/\n/g, "<br>");

  return `<p class="my-2">${html}</p>`;
}

export function ChatMessage({
  message,
  onDelete,
  onRegenerate,
  onBranch,
  onSpeak,
  isStreaming,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle code copy buttons
  useEffect(() => {
    const handleCodeCopy = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("copy-code-btn")) {
        const code = decodeURIComponent(target.dataset.code || "");
        copyToClipboard(code);
        target.textContent = "Copied!";
        setTimeout(() => {
          target.textContent = "Copy";
        }, 2000);
      }
    };

    document.addEventListener("click", handleCodeCopy);
    return () => document.removeEventListener("click", handleCodeCopy);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex gap-4 p-4 rounded-xl transition-colors",
        isUser
          ? "bg-[var(--neon-purple)]/5 border border-[var(--neon-purple)]/20"
          : "bg-[var(--glass-bg)] border border-[var(--glass-border)]",
        isStreaming && "border-[var(--neon-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.1)]"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          isUser
            ? "bg-[var(--neon-purple)]/20 text-[var(--neon-purple)]"
            : "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.model && (
            <Badge variant="outline" className="text-[10px]">
              {message.model}
            </Badge>
          )}
          <span className="text-xs text-[var(--foreground-muted)]">
            {formatTimestamp(new Date(message.timestamp))}
          </span>
          {isStreaming && (
            <Badge variant="cyan" className="text-[10px] animate-pulse">
              Generating...
            </Badge>
          )}
        </div>

        {/* Message Content */}
        <div
          className="markdown-content text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
        />

        {/* Image */}
        {message.imageUrl && (
          <div className="mt-3">
            <img
              src={message.imageUrl}
              alt="Generated or uploaded image"
              className="max-w-full h-auto rounded-lg border border-[var(--glass-border)]"
            />
          </div>
        )}

        {/* Audio */}
        {message.audioUrl && (
          <div className="mt-3">
            <audio
              controls
              src={message.audioUrl}
              className="w-full max-w-md"
            />
          </div>
        )}

        {/* Streaming cursor */}
        {isStreaming && (
          <span className="inline-block w-2 h-5 ml-1 bg-[var(--neon-cyan)] cursor-blink" />
        )}
      </div>

      {/* Actions */}
      {showActions && !isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 flex gap-1"
        >
          <Tooltip content={copied ? "Copied!" : "Copy"}>
            <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4 text-[var(--neon-green)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </Tooltip>

          {isAssistant && onSpeak && (
            <Tooltip content="Read aloud">
              <Button variant="ghost" size="icon-sm" onClick={onSpeak}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {isAssistant && onRegenerate && (
            <Tooltip content="Regenerate">
              <Button variant="ghost" size="icon-sm" onClick={onRegenerate}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {onBranch && (
            <Tooltip content="Branch conversation">
              <Button variant="ghost" size="icon-sm" onClick={onBranch}>
                <GitBranch className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip content="Delete">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                className="text-[var(--neon-red)] hover:text-[var(--neon-red)]"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
