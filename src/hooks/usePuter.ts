"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { AIModel } from "@/types/puter";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  imageUrl?: string; // Base64 data URL or HTTP URL for vision models
}

interface UsePuterReturn {
  puter: any | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  models: AIModel[];
  loadModels: () => Promise<AIModel[]>;
  chat: (
    prompt: string,
    options?: ChatOptions
  ) => Promise<string>;
  streamChat: (
    prompt: string,
    options: ChatOptions | undefined,
    onChunk: (chunk: string) => void,
    onComplete?: () => void
  ) => Promise<void>;
  stopGeneration: () => void;
  generateImage: (prompt: string, model?: string) => Promise<string>;
  textToSpeech: (text: string) => Promise<string>;
  saveToCloud: (key: string, data: unknown) => Promise<void>;
  loadFromCloud: <T>(key: string) => Promise<T | null>;
  deleteFromCloud: (key: string) => Promise<void>;
  isSignedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  username: string | null;
}

const PUTER_SCRIPT_URL = "https://js.puter.com/v2/";

// Helper to extract error message from various error formats
function getErrorMessage(err: any): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error) return typeof err.error === "string" ? err.error : err.error.message || JSON.stringify(err.error);
  if (err.msg) return err.msg;
  if (err.detail) return err.detail;
  if (err.statusText) return err.statusText;
  try {
    const str = JSON.stringify(err);
    if (str !== "{}") return str;
  } catch {}
  return "Request failed - please try a different model";
}

export function usePuter(): UsePuterReturn {
  const [puter, setPuter] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAbortedRef = useRef(false);
  const currentRequestIdRef = useRef(0);

  // Load Puter.js script
  useEffect(() => {
    const loadPuter = async () => {
      try {
        // Check if already loaded
        if (typeof window !== 'undefined' && (window as any).puter) {
          setPuter((window as any).puter);
          setIsReady(true);
          setIsLoading(false);
          return;
        }

        // Create script element
        const script = document.createElement("script");
        script.src = PUTER_SCRIPT_URL;
        script.async = true;

        script.onload = () => {
          // Give it a moment to initialize
          setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).puter) {
              setPuter((window as any).puter);
              setIsReady(true);
              console.log("Puter.js loaded successfully");
            } else {
              setError("Puter.js loaded but SDK not available");
            }
            setIsLoading(false);
          }, 500);
        };

        script.onerror = () => {
          setError("Failed to load Puter.js SDK");
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        setError(getErrorMessage(err));
        setIsLoading(false);
      }
    };

    loadPuter();
  }, []);

  // Check auth status when ready
  useEffect(() => {
    const checkAuth = async () => {
      if (!puter) return;
      try {
        const signedIn = await puter.auth.isSignedIn();
        setIsSignedIn(signedIn);
        if (signedIn) {
          const user = await puter.auth.getUser();
          setUsername(user?.username || null);
        }
      } catch {
        setIsSignedIn(false);
      }
    };
    checkAuth();
  }, [puter]);

  // Load available models
  const loadModels = useCallback(async (): Promise<AIModel[]> => {
    if (!puter) {
      throw new Error("Puter.js not ready");
    }

    // Reliable models that work consistently (direct vendor, not OpenRouter)
    const reliableModelPrefixes = [
      // OpenAI direct
      'openai:', 'gpt-4o', 'gpt-5', 'gpt-4.1', 'o1', 'o3', 'o4',
      // Anthropic direct
      'anthropic:', 'claude',
      // Google direct
      'google:', 'gemini',
      // DeepSeek direct
      'deepseek:',
      // Mistral direct
      'mistralai:',
      // xAI direct
      'x-ai:', 'grok',
      // TogetherAI (reliable)
      'togetherai:',
    ];

    // Models to exclude (often unreliable or deprecated)
    const excludePatterns = [
      'openrouter:', // OpenRouter models can be flaky
      ':free', // Free tier models often rate limited
      'preview', // Preview models may be unstable
      'beta', // Beta models may be unstable
    ];

    try {
      const modelList = await puter.ai.listModels();
      console.log("Raw models response:", modelList);
      
      // Transform to our format
      let transformed = Array.isArray(modelList) ? modelList.map((m: any) => ({
        id: m.id || m.name || String(m),
        name: m.name || m.id || String(m),
        provider: m.provider || m.vendor || "Unknown",
        context_window: m.context_window || m.contextWindow || 4096,
        max_tokens: m.max_tokens || m.maxTokens,
        supports_vision: m.supports_vision || m.vision || m.supportsVision || false,
        supports_streaming: true,
      })) : [];
      
      // Filter to only reliable models
      transformed = transformed.filter((m: AIModel) => {
        const id = m.id.toLowerCase();
        
        // Exclude unreliable patterns
        if (excludePatterns.some(pattern => id.includes(pattern.toLowerCase()))) {
          return false;
        }
        
        // Include if matches reliable prefixes
        return reliableModelPrefixes.some(prefix => 
          id.toLowerCase().startsWith(prefix.toLowerCase()) ||
          id.toLowerCase().includes(prefix.toLowerCase().replace(':', '/'))
        );
      });
      
      console.log("Filtered reliable models:", transformed.length);
      setModels(transformed);
      return transformed;
    } catch (err) {
      console.error("Failed to load models:", err);
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, [puter]);

  // Non-streaming chat - simple string prompt
  const chat = useCallback(
    async (prompt: string, options?: ChatOptions): Promise<string> => {
      if (!puter) {
        throw new Error("Puter.js not ready");
      }

      const model = options?.model || "gpt-4o-mini";
      const imageUrl = options?.imageUrl;
      console.log(`Chat request - Model: ${model}, Prompt length: ${prompt.length}, Has image: ${!!imageUrl}`);

      try {
        // If there's an image, use the vision-capable API format: puter.ai.chat(prompt, image, options)
        // Otherwise use the simple format: puter.ai.chat(prompt, options)
        const response = imageUrl 
          ? await puter.ai.chat(prompt, imageUrl, { 
              model,
              stream: false 
            })
          : await puter.ai.chat(prompt, { 
              model,
              stream: false 
            });
        
        console.log("Chat response type:", typeof response);
        
        // Handle the response - it could be various formats
        if (typeof response === 'string') {
          return response;
        }
        
        // Response object with toString
        if (response && typeof response.toString === 'function' && response.toString() !== '[object Object]') {
          return response.toString();
        }
        
        // Response with message.content (OpenAI format)
        if (response?.message?.content) {
          return response.message.content;
        }
        
        // Response with text property
        if (response?.text) {
          return response.text;
        }
        
        // Response with content property
        if (response?.content) {
          return response.content;
        }

        // Last resort - stringify
        console.log("Unexpected response format:", response);
        return JSON.stringify(response);
      } catch (err: any) {
        console.error("Chat error details:", err);
        console.error("Error keys:", err ? Object.keys(err) : "null");
        const message = getErrorMessage(err);
        throw new Error(message);
      }
    },
    [puter]
  );

  // Stop generation
  const stopGeneration = useCallback(() => {
    console.log("Stopping generation...");
    isAbortedRef.current = true;
    // Increment request ID so any in-flight requests know they're stale
    currentRequestIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Streaming chat
  const streamChat = useCallback(
    async (
      prompt: string,
      options: ChatOptions | undefined,
      onChunk: (chunk: string) => void,
      onComplete?: () => void
    ): Promise<void> => {
      if (!puter) {
        throw new Error("Puter.js not ready");
      }

      // Reset abort state and create new controller with unique request ID
      isAbortedRef.current = false;
      abortControllerRef.current = new AbortController();
      currentRequestIdRef.current += 1;
      const thisRequestId = currentRequestIdRef.current;

      const model = options?.model || "gpt-4o-mini";
      const imageUrl = options?.imageUrl;
      console.log(`Stream request #${thisRequestId} - Model: ${model}, Has image: ${!!imageUrl}`);

      try {
        // If there's an image, use the vision-capable API format: puter.ai.chat(prompt, image, options)
        // Otherwise use the simple format: puter.ai.chat(prompt, options)
        const response = imageUrl
          ? await puter.ai.chat(prompt, imageUrl, { 
              model, 
              stream: true 
            })
          : await puter.ai.chat(prompt, { 
              model, 
              stream: true 
            });
        
        console.log("Stream response type:", typeof response, response);

        // Helper to check if this specific request should stop
        // A request should stop if aborted OR if a newer request has started (making this one stale)
        const shouldStopRequest = () => isAbortedRef.current || currentRequestIdRef.current !== thisRequestId;

        // Check if it's an async iterable
        if (response && typeof response[Symbol.asyncIterator] === 'function') {
          for await (const part of response) {
            // Check if aborted or if a new request has started
            if (shouldStopRequest()) {
              console.log(`Request #${thisRequestId} aborted or superseded`);
              onComplete?.();
              return;
            }
            const text = part?.text || part?.content || part?.delta?.content || 
                        (typeof part === 'string' ? part : '');
            if (text) {
              onChunk(text);
            }
          }
          onComplete?.();
        } else if (typeof response === 'string') {
          if (!shouldStopRequest()) onChunk(response);
          onComplete?.();
        } else if (response?.toString && response.toString() !== '[object Object]') {
          if (!shouldStopRequest()) onChunk(response.toString());
          onComplete?.();
        } else {
          // Fallback - try to extract text
          const text = response?.message?.content || response?.text || response?.content || '';
          if (text && !shouldStopRequest()) {
            onChunk(text);
          }
          onComplete?.();
        }
      } catch (err: any) {
        // Don't throw if aborted
        if (isAbortedRef.current) {
          console.log(`Request #${thisRequestId} was aborted`);
          onComplete?.();
          return;
        }
        console.error("Stream error details:", err);
        console.error("Error keys:", err ? Object.keys(err) : "null");
        const message = getErrorMessage(err);
        throw new Error(message);
      }
    },
    [puter]
  );

  // Generate image
  const generateImage = useCallback(
    async (prompt: string, model?: string): Promise<string> => {
      if (!puter) {
        throw new Error("Puter.js not ready");
      }

      try {
        const response = await puter.ai.txt2img(prompt, model ? { model } : undefined);
        
        if (typeof response === 'string') return response;
        if (response?.src) return response.src;
        if (response?.url) return response.url;
        if (response?.images?.[0]) {
          const img = response.images[0];
          return img.url || img.src || `data:image/png;base64,${img.b64_json || img.base64}`;
        }
        throw new Error("No image in response");
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [puter]
  );

  // Text to speech
  const textToSpeech = useCallback(
    async (text: string): Promise<string> => {
      if (!puter) {
        throw new Error("Puter.js not ready");
      }

      try {
        const response = await puter.ai.txt2speech(text);
        if (typeof response === 'string') return response;
        if (response?.url) return response.url;
        if (response?.src) return response.src;
        if (response instanceof Blob) return URL.createObjectURL(response);
        if (response?.audio instanceof Blob) return URL.createObjectURL(response.audio);
        throw new Error("No audio in response");
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [puter]
  );

  // Cloud storage - save
  const saveToCloud = useCallback(
    async (key: string, data: unknown): Promise<void> => {
      if (!puter) throw new Error("Puter.js not ready");
      try {
        await puter.kv.set(key, JSON.stringify(data));
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [puter]
  );

  // Cloud storage - load
  const loadFromCloud = useCallback(
    async <T>(key: string): Promise<T | null> => {
      if (!puter) throw new Error("Puter.js not ready");
      try {
        const data = await puter.kv.get(key);
        return data ? JSON.parse(data) as T : null;
      } catch {
        return null;
      }
    },
    [puter]
  );

  // Cloud storage - delete
  const deleteFromCloud = useCallback(
    async (key: string): Promise<void> => {
      if (!puter) throw new Error("Puter.js not ready");
      try {
        await puter.kv.del(key);
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [puter]
  );

  // Sign in
  const signIn = useCallback(async (): Promise<void> => {
    if (!puter) throw new Error("Puter.js not ready");
    try {
      const user = await puter.auth.signIn();
      setIsSignedIn(true);
      setUsername(user?.username || null);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, [puter]);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    if (!puter) throw new Error("Puter.js not ready");
    try {
      await puter.auth.signOut();
      setIsSignedIn(false);
      setUsername(null);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, [puter]);

  return {
    puter,
    isLoading,
    isReady,
    error,
    models,
    loadModels,
    chat,
    streamChat,
    stopGeneration,
    generateImage,
    textToSpeech,
    saveToCloud,
    loadFromCloud,
    deleteFromCloud,
    isSignedIn,
    signIn,
    signOut,
    username,
  };
}
