import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadAsFile(content: string, filename: string, type: string = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Base64 encoding/decoding
export function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export function decodeBase64(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

// ROT13 encoding
export function rot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const start = char <= "Z" ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
  });
}

// Leetspeak conversion
export function toLeetspeak(str: string): string {
  const leetMap: Record<string, string> = {
    a: "4", A: "4",
    e: "3", E: "3",
    i: "1", I: "1",
    o: "0", O: "0",
    s: "5", S: "5",
    t: "7", T: "7",
    l: "1", L: "1",
    b: "8", B: "8",
  };
  return str.replace(/[aeiostlbAEIOSTLB]/g, (char) => leetMap[char] || char);
}

// Homoglyph substitution
export function toHomoglyphs(str: string): string {
  const homoglyphMap: Record<string, string> = {
    a: "\u0430", // Cyrillic а
    e: "\u0435", // Cyrillic е
    o: "\u043E", // Cyrillic о
    p: "\u0440", // Cyrillic р
    c: "\u0441", // Cyrillic с
    x: "\u0445", // Cyrillic х
    A: "\u0410", // Cyrillic А
    E: "\u0415", // Cyrillic Е
    O: "\u041E", // Cyrillic О
    P: "\u0420", // Cyrillic Р
    C: "\u0421", // Cyrillic С
    X: "\u0425", // Cyrillic Х
  };
  return str.split("").map((char) => homoglyphMap[char] || char).join("");
}

// Truncate text with ellipsis
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}

// Format timestamp
export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format date
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
