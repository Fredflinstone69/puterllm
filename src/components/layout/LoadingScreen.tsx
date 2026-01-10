"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--background)] cyber-grid gradient-mesh flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        {/* Logo */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative mx-auto w-24 h-24"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] opacity-50 blur-xl" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] p-[3px]">
            <div className="w-full h-full rounded-2xl bg-[var(--background)] flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-[var(--neon-cyan)]" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--neon-purple)] to-[var(--neon-magenta)] bg-clip-text text-transparent">
            PuterLLM
          </h1>
          <p className="text-[var(--foreground-muted)] mt-2">
            Zero-Config AI Platform
          </p>
        </div>

        {/* Loading spinner */}
        <div className="flex items-center justify-center gap-3">
          <div className="spinner-neon" />
          <span className="text-[var(--foreground-muted)]">
            Initializing Puter.js...
          </span>
        </div>

        {/* Loading bar */}
        <div className="w-64 h-1 mx-auto rounded-full bg-[var(--background-secondary)] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Glitch text effect */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-[var(--foreground-muted)]"
        >
          100+ AI models at your fingertips
        </motion.p>
      </motion.div>
    </div>
  );
}
