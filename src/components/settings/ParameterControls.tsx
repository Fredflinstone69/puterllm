"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Thermometer,
  Sparkles,
  Hash,
  ChevronDown,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, getPromptPrefixForDepth } from "@/store";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Tooltip } from "@/components/ui/Tooltip";
import { Badge } from "@/components/ui/Badge";

const depthDescriptions = [
  { level: 0, name: "Instant", desc: "Direct, minimal processing" },
  { level: 2, name: "Quick", desc: "Fast response, basic reasoning" },
  { level: 4, name: "Balanced", desc: "Good reasoning, moderate detail" },
  { level: 6, name: "Thorough", desc: "Detailed analysis, step-by-step" },
  { level: 8, name: "Deep", desc: "Comprehensive, multi-perspective" },
  { level: 10, name: "Maximum", desc: "Full chain-of-thought with self-critique" },
];

export function ParameterControls() {
  const {
    parameters,
    setThinkingDepth,
    setTemperature,
    setTopP,
    setMaxTokens,
    setSystemPrompt,
    resetParameters,
    promptPreviewOpen,
    togglePromptPreview,
  } = useAppStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentDepthLevel = depthDescriptions.reduce((prev, curr) =>
    parameters.thinkingDepth >= curr.level ? curr : prev
  );

  const promptPrefix = getPromptPrefixForDepth(parameters.thinkingDepth);

  return (
    <div className="space-y-6">
      {/* Thinking Depth - Primary Control */}
      <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--neon-purple)]" />
            <span className="font-medium">Thinking Depth</span>
          </div>
          <Badge variant="default">{currentDepthLevel.name}</Badge>
        </div>

        <Slider
          value={parameters.thinkingDepth}
          onChange={setThinkingDepth}
          min={0}
          max={10}
          step={1}
          showPlusMinus
          valueFormatter={(v) => v.toString()}
        />

        <p className="mt-3 text-sm text-[var(--foreground-muted)]">
          {currentDepthLevel.desc}
        </p>

        {/* Depth indicators */}
        <div className="flex justify-between mt-3">
          {depthDescriptions.map((d) => (
            <Tooltip key={d.level} content={d.desc}>
              <button
                onClick={() => setThinkingDepth(d.level)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  parameters.thinkingDepth >= d.level
                    ? "bg-[var(--neon-purple)] shadow-[0_0_8px_var(--neon-purple)]"
                    : "bg-[var(--background-tertiary)]"
                )}
              />
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Prompt Preview Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--foreground-muted)]">
          Prompt Prefix Preview
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePromptPreview}
          className="gap-2"
        >
          {promptPreviewOpen ? (
            <>
              <EyeOff className="w-4 h-4" /> Hide
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> Show
            </>
          )}
        </Button>
      </div>

      {/* Prompt Prefix Preview */}
      <AnimatePresence>
        {promptPreviewOpen && promptPrefix && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)]">
              <p className="text-xs text-[var(--foreground-muted)] mb-2">
                This prefix will be added to your prompts:
              </p>
              <pre className="text-sm text-[var(--neon-cyan)] whitespace-pre-wrap font-mono">
                {promptPrefix}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--neon-cyan)] transition-colors w-full justify-center"
      >
        <span>Advanced Parameters</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            showAdvanced && "rotate-180"
          )}
        />
      </button>

      {/* Advanced Parameters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Temperature */}
            <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-4 h-4 text-[var(--neon-orange)]" />
                <span className="text-sm">Temperature</span>
                <Tooltip content="Controls randomness. Lower = more focused, Higher = more creative">
                  <span className="text-xs text-[var(--foreground-muted)]">(?)</span>
                </Tooltip>
              </div>
              <Slider
                value={parameters.temperature}
                onChange={setTemperature}
                min={0}
                max={2}
                step={0.1}
                showPlusMinus
                valueFormatter={(v) => v.toFixed(1)}
              />
            </div>

            {/* Top P */}
            <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[var(--neon-yellow)]" />
                <span className="text-sm">Top P (Nucleus Sampling)</span>
                <Tooltip content="Limits token selection to top probability mass">
                  <span className="text-xs text-[var(--foreground-muted)]">(?)</span>
                </Tooltip>
              </div>
              <Slider
                value={parameters.topP}
                onChange={setTopP}
                min={0.1}
                max={1}
                step={0.05}
                showPlusMinus
                valueFormatter={(v) => v.toFixed(2)}
              />
            </div>

            {/* Max Tokens */}
            <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-[var(--neon-blue)]" />
                <span className="text-sm">Max Tokens</span>
                <Tooltip content="Maximum length of the response">
                  <span className="text-xs text-[var(--foreground-muted)]">(?)</span>
                </Tooltip>
              </div>
              <Slider
                value={parameters.maxTokens}
                onChange={setMaxTokens}
                min={256}
                max={16384}
                step={256}
                showPlusMinus
                valueFormatter={(v) => v.toLocaleString()}
              />
            </div>

            {/* System Prompt */}
            <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-[var(--neon-green)]" />
                <span className="text-sm">Custom System Prompt</span>
              </div>
              <Textarea
                value={parameters.systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter a custom system prompt to set the AI's behavior..."
                className="min-h-[80px] text-sm"
              />
            </div>

            {/* Reset Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetParameters}
              className="w-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
