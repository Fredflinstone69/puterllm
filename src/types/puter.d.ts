/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    puter: PuterSDK;
  }
}

export interface PuterSDK {
  ai: PuterAI;
  fs: PuterFS;
  kv: PuterKV;
  auth: PuterAuth;
}

export interface PuterAI {
  chat: (
    prompt: string | ChatMessage[],
    options?: ChatOptions
  ) => Promise<ChatResponse | AsyncIterable<StreamChunk>>;
  txt2img: (prompt: string, options?: Txt2ImgOptions) => Promise<ImageResponse>;
  img2txt: (image: string | File | Blob, options?: Img2TxtOptions) => Promise<string>;
  txt2speech: (text: string, options?: Txt2SpeechOptions) => Promise<AudioResponse>;
  listModels: () => Promise<AIModel[]>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | MessageContent[];
}

export interface MessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  system?: string;
}

export interface ChatResponse {
  message: {
    role: "assistant";
    content: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  text?: string;
  done?: boolean;
}

export interface AIModel {
  id: string;
  name?: string;
  provider?: string;
  context_window?: number;
  max_tokens?: number;
  supports_vision?: boolean;
  supports_streaming?: boolean;
  cost?: {
    input: number;
    output: number;
  };
}

export interface Txt2ImgOptions {
  model?: string;
  size?: string;
  n?: number;
}

export interface ImageResponse {
  images: Array<{
    url: string;
    b64_json?: string;
  }>;
}

export interface Img2TxtOptions {
  model?: string;
  prompt?: string;
}

export interface Txt2SpeechOptions {
  model?: string;
  voice?: string;
}

export interface AudioResponse {
  audio: Blob;
  url?: string;
}

export interface PuterFS {
  write: (path: string, content: string | Blob) => Promise<FSItem>;
  read: (path: string) => Promise<string | Blob>;
  readdir: (path: string) => Promise<FSItem[]>;
  mkdir: (path: string) => Promise<FSItem>;
  delete: (path: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  stat: (path: string) => Promise<FSItem>;
}

export interface FSItem {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number;
  modified?: string;
  created?: string;
}

export interface PuterKV {
  set: (key: string, value: any) => Promise<void>;
  get: (key: string) => Promise<any>;
  del: (key: string) => Promise<void>;
  list: () => Promise<string[]>;
  flush: () => Promise<void>;
}

export interface PuterAuth {
  signIn: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  getUser: () => Promise<AuthUser | null>;
  isSignedIn: () => Promise<boolean>;
}

export interface AuthUser {
  uuid: string;
  username: string;
  email?: string;
}

export {};
