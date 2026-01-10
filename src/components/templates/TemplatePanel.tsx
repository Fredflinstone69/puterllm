"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Copy,
  Plus,
  Trash2,
  Edit3,
  Wand2,
  ChevronRight,
  Shield,
  Code,
  BookOpen,
  Zap,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn, copyToClipboard, encodeBase64, rot13, toLeetspeak, toHomoglyphs } from "@/lib/utils";
import { useAppStore, builtInTemplates } from "@/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

const categoryIcons: Record<string, React.ReactNode> = {
  Jailbreak: <Lock className="w-4 h-4" />,
  Adversarial: <Shield className="w-4 h-4" />,
  Encoding: <Code className="w-4 h-4" />,
  "Policy Wrap": <BookOpen className="w-4 h-4" />,
  Creative: <Sparkles className="w-4 h-4" />,
  "System Prompt": <Zap className="w-4 h-4" />,
  Utility: <Wand2 className="w-4 h-4" />,
  Advanced: <Sparkles className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  Jailbreak: "magenta",
  Adversarial: "red",
  Encoding: "cyan",
  "Policy Wrap": "yellow",
  Creative: "green",
  "System Prompt": "default",
  Utility: "cyan",
  Advanced: "default",
};

export function TemplatePanel() {
  const {
    templates,
    selectedTemplate,
    selectTemplate,
    inputText,
    setInputText,
    addCustomTemplate,
    deleteCustomTemplate,
    templatePanelOpen,
    toggleTemplatePanel,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "Custom",
    description: "",
    template: "",
    tags: "",
  });
  const [activeObfuscation, setActiveObfuscation] = useState<string | null>(null);

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return Array.from(cats);
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    return result;
  }, [templates, searchQuery, selectedCategory]);

  // Get selected template
  const template = selectedTemplate
    ? templates.find((t) => t.id === selectedTemplate)
    : null;

  // Apply template to input
  const applyTemplate = (templateText: string) => {
    // Replace placeholder with current input or leave placeholder
    let finalText = templateText;
    
    if (inputText.trim()) {
      finalText = templateText.replace(/\[INSERT.*?\]/gi, inputText);
    }
    
    setInputText(finalText);
  };

  // Obfuscation functions
  const obfuscatePrompt = (type: string) => {
    if (!inputText) return;
    
    let result = inputText;
    switch (type) {
      case "base64":
        result = `Please decode and respond to this Base64 message:\n${encodeBase64(inputText)}`;
        break;
      case "rot13":
        result = `Please decode this ROT13 message and respond:\n${rot13(inputText)}`;
        break;
      case "leetspeak":
        result = toLeetspeak(inputText);
        break;
      case "homoglyphs":
        result = toHomoglyphs(inputText);
        break;
    }
    
    setInputText(result);
    setActiveObfuscation(type);
  };

  // Handle create template
  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.template) return;

    addCustomTemplate({
      name: newTemplate.name,
      category: newTemplate.category || "Custom",
      description: newTemplate.description,
      template: newTemplate.template,
      tags: newTemplate.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    setNewTemplate({
      name: "",
      category: "Custom",
      description: "",
      template: "",
      tags: "",
    });
    setShowCreateModal(false);
  };

  if (!templatePanelOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed right-0 top-0 bottom-0 w-96 bg-[var(--background)] border-l border-[var(--glass-border)] shadow-2xl z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-[var(--neon-purple)]" />
          Prompt Templates
        </h2>
        <Button variant="ghost" size="icon-sm" onClick={toggleTemplatePanel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Search and Actions */}
      <div className="p-4 space-y-3 border-b border-[var(--glass-border)]">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          icon={<Search className="w-4 h-4" />}
        />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => inputText && applyTemplate(inputText)}
            disabled={!template}
          >
            Apply Selected
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-3 h-3" />
            Create
          </Button>
        </div>

        {/* Obfuscation Tools */}
        <div className="space-y-2">
          <p className="text-xs text-[var(--foreground-muted)]">Obfuscate Prompt:</p>
          <div className="flex flex-wrap gap-1">
            {["base64", "rot13", "leetspeak", "homoglyphs"].map((type) => (
              <Button
                key={type}
                variant={activeObfuscation === type ? "neon" : "ghost"}
                size="sm"
                onClick={() => obfuscatePrompt(type)}
                disabled={!inputText}
                className="text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 p-4 overflow-x-auto border-b border-[var(--glass-border)]">
        <Button
          variant={selectedCategory === null ? "neon" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "neon" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="whitespace-nowrap"
          >
            {categoryIcons[cat]}
            {cat}
          </Button>
        ))}
      </div>

      {/* Template List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredTemplates.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => selectTemplate(t.id)}
            className={cn(
              "w-full p-3 rounded-lg text-left transition-all",
              selectedTemplate === t.id
                ? "bg-[var(--neon-purple)]/10 border border-[var(--neon-purple)]"
                : "bg-[var(--background-secondary)] border border-[var(--glass-border)] hover:border-[var(--neon-purple)]/50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {categoryIcons[t.category]}
                <span className="font-medium text-sm">{t.name}</span>
              </div>
              {t.isCustom && (
                <Badge variant="cyan" className="text-[10px]">
                  Custom
                </Badge>
              )}
            </div>
            <p className="text-xs text-[var(--foreground-muted)] line-clamp-2">
              {t.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge
                variant={(categoryColors[t.category] as "magenta" | "red" | "cyan" | "yellow" | "green" | "default" | "outline") || "outline"}
                className="text-[10px]"
              >
                {t.category}
              </Badge>
              {t.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Template Preview */}
      <AnimatePresence>
        {template && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="border-t border-[var(--glass-border)] overflow-hidden"
          >
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{template.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(template.template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {template.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteCustomTemplate(template.id)}
                      className="text-[var(--neon-red)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <pre className="text-xs text-[var(--foreground-muted)] whitespace-pre-wrap bg-[var(--background-secondary)] p-3 rounded-lg max-h-32 overflow-y-auto">
                {template.template}
              </pre>
              <Button
                variant="neon"
                size="sm"
                className="w-full"
                onClick={() => applyTemplate(template.template)}
              >
                <ChevronRight className="w-4 h-4" />
                Apply to Input
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Custom Template"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            placeholder="Template name"
          />
          <Input
            value={newTemplate.category}
            onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
            placeholder="Category (e.g., Custom, Jailbreak, etc.)"
          />
          <Input
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            placeholder="Short description"
          />
          <Textarea
            value={newTemplate.template}
            onChange={(e) => setNewTemplate({ ...newTemplate, template: e.target.value })}
            placeholder="Template text (use [INSERT PROMPT HERE] for user input placeholder)"
            className="min-h-[150px]"
          />
          <Input
            value={newTemplate.tags}
            onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
            placeholder="Tags (comma-separated)"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="neon"
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !newTemplate.template}
            >
              Create Template
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
