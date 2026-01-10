"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, Download, Sparkles } from "lucide-react";
import { downloadAsFile } from "@/lib/utils";
import { useAppStore } from "@/store";
import { usePuter } from "@/hooks/usePuter";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function ChatContainer() {
  const {
    conversations,
    currentConversationId,
    selectedModel,
    parameters,
    isGenerating,
    setIsGenerating,
    streamingContent,
    appendStreamingContent,
    clearStreamingContent,
    addMessage,
    deleteMessage,
    clearCurrentConversation,
    createBranch,
    fallbackModels,
  } = useAppStore();

  const {
    isReady,
    streamChat,
    chat,
    generateImage,
    textToSpeech,
    error: puterError,
  } = usePuter();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fullContentRef = useRef<string>("");

  // Get current conversation
  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );
  const messages = currentConversation?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Build a simple prompt from conversation history
  const buildPrompt = useCallback((userMessage: string): string => {
    let prompt = "";
    
    // Add system prompt if set
    if (parameters.systemPrompt) {
      prompt += `System: ${parameters.systemPrompt}\n\n`;
    }
    
    // Add recent conversation history (last 10 messages for context)
    const recentMessages = messages.slice(-10);
    if (recentMessages.length > 0) {
      prompt += "Previous conversation:\n";
      recentMessages.forEach((msg) => {
        const role = msg.role === "user" ? "User" : "Assistant";
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += "\n";
    }
    
    // Add current user message
    prompt += `User: ${userMessage}\n\nAssistant:`;
    
    return prompt;
  }, [messages, parameters.systemPrompt]);

  // Handle send message
  const handleSend = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!isReady) {
        setError("Puter.js is not ready yet. Please wait...");
        return;
      }

      if (!selectedModel) {
        setError("Please select a model first");
        return;
      }

      setError(null);
      setIsGenerating(true);
      clearStreamingContent();
      fullContentRef.current = "";

      // Add user message
      addMessage({
        role: "user",
        content,
        imageUrl,
      });

      // Build the prompt
      const prompt = buildPrompt(content);
      console.log("Sending prompt:", prompt.substring(0, 200) + "...");

      // Try models with fallback
      const modelsToTry = [selectedModel, ...fallbackModels.filter(m => m !== selectedModel)];
      let success = false;
      let lastError = "";

      for (const model of modelsToTry) {
        if (success) break;

        try {
          console.log(`Trying model: ${model}`);
          
          // Try streaming first
          try {
            await streamChat(
              prompt,
              {
                model,
                temperature: parameters.temperature,
                max_tokens: parameters.maxTokens,
              },
              (chunk) => {
                fullContentRef.current += chunk;
                appendStreamingContent(chunk);
              },
              () => {
                console.log("Stream complete, content length:", fullContentRef.current.length);
              }
            );

            // If we got content, add the message
            if (fullContentRef.current) {
              addMessage({
                role: "assistant",
                content: fullContentRef.current,
                model,
              });
              success = true;
            } else {
              throw new Error("Empty response from streaming");
            }
          } catch (streamErr: any) {
            console.warn(`Streaming failed for ${model}:`, streamErr?.message || streamErr);
            
            // Fallback to non-streaming
            console.log("Trying non-streaming fallback...");
            const response = await chat(prompt, {
              model,
              temperature: parameters.temperature,
              max_tokens: parameters.maxTokens,
            });

            if (response) {
              addMessage({
                role: "assistant",
                content: response,
                model,
              });
              success = true;
            } else {
              throw new Error("Empty response from chat");
            }
          }
        } catch (err: any) {
          console.error(`Failed with model ${model}:`, err?.message || err);
          lastError = err?.message || "Unknown error";
        }
      }

      if (!success) {
        setError(`Failed: ${lastError}`);
        addMessage({
          role: "assistant",
          content: `Sorry, I encountered an error: ${lastError}\n\nPlease try again or select a different model.`,
          model: selectedModel,
        });
      }

      setIsGenerating(false);
      clearStreamingContent();
    },
    [
      isReady,
      selectedModel,
      parameters,
      fallbackModels,
      streamChat,
      chat,
      addMessage,
      setIsGenerating,
      appendStreamingContent,
      clearStreamingContent,
      buildPrompt,
    ]
  );

  // Handle image generation
  const handleImageGenerate = useCallback(
    async (prompt: string) => {
      if (!isReady) {
        setError("Puter.js is not ready yet");
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const imageUrl = await generateImage(prompt);
        addMessage({
          role: "assistant",
          content: `Generated image for: "${prompt}"`,
          imageUrl,
          model: "txt2img",
        });
      } catch (err: any) {
        setError(err?.message || "Failed to generate image");
      } finally {
        setIsGenerating(false);
      }
    },
    [isReady, generateImage, addMessage, setIsGenerating]
  );

  // Handle text-to-speech
  const handleSpeak = useCallback(
    async (text: string) => {
      if (!isReady) return;

      try {
        const audioUrl = await textToSpeech(text);
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (err) {
        console.error("TTS failed:", err);
      }
    },
    [isReady, textToSpeech]
  );

  // Handle regenerate
  const handleRegenerate = useCallback(
    async (messageId: string) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex < 0) return;

      // Find the user message before this one
      const userMessage = messages
        .slice(0, messageIndex)
        .reverse()
        .find((m) => m.role === "user");
      if (!userMessage) return;

      // Delete the assistant message
      deleteMessage(messageId);

      // Resend
      handleSend(userMessage.content, userMessage.imageUrl);
    },
    [messages, deleteMessage, handleSend]
  );

  // Handle branch
  const handleBranch = useCallback(
    (messageId: string) => {
      createBranch(messageId);
    },
    [createBranch]
  );

  // Handle export
  const handleExport = () => {
    if (!currentConversation) return;
    const json = JSON.stringify(currentConversation, null, 2);
    downloadAsFile(json, `conversation-${currentConversation.id}.json`, "application/json");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[var(--neon-cyan)]" />
          <h2 className="font-medium">
            {currentConversation?.title || "New Chat"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleExport}
            disabled={messages.length === 0}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={messages.length === 0}
            className="text-[var(--neon-red)]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] p-[2px]">
                <div className="w-full h-full rounded-2xl bg-[var(--background)] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-[var(--neon-cyan)]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Start a conversation</h3>
              <p className="text-[var(--foreground-muted)] max-w-md">
                Select a model, adjust the thinking depth, and start chatting.
                You can also use prompt templates for advanced interactions.
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={message.isStreaming}
                onDelete={() => deleteMessage(message.id)}
                onRegenerate={
                  message.role === "assistant"
                    ? () => handleRegenerate(message.id)
                    : undefined
                }
                onBranch={() => handleBranch(message.id)}
                onSpeak={
                  message.role === "assistant"
                    ? () => handleSpeak(message.content)
                    : undefined
                }
              />
            ))}

            {/* Streaming message */}
            {isGenerating && streamingContent && (
              <ChatMessage
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  timestamp: new Date(),
                  model: selectedModel || undefined,
                  isStreaming: true,
                }}
                isStreaming
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error display */}
      <AnimatePresence>
        {(error || puterError) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-4 p-3 rounded-lg bg-[var(--neon-red)]/10 border border-[var(--neon-red)]/30 text-[var(--neon-red)] text-sm"
          >
            {error || puterError}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        <ChatInput
          onSend={handleSend}
          onImageGenerate={handleImageGenerate}
          isGenerating={isGenerating}
          disabled={!isReady}
        />
      </div>

      {/* Clear confirmation modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear Conversation"
        size="sm"
      >
        <p className="text-[var(--foreground-muted)] mb-4">
          Are you sure you want to clear this conversation? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowClearConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              clearCurrentConversation();
              setShowClearConfirm(false);
            }}
          >
            Clear
          </Button>
        </div>
      </Modal>
    </div>
  );
}
