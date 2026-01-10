import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PuterLLM - Zero-Config AI Platform",
  description: "Access 100+ AI models instantly with no API keys or sign-ups required. Built with Puter.js for seamless cloud AI access.",
  keywords: ["AI", "LLM", "ChatGPT", "Claude", "Puter", "Machine Learning", "Chat", "GPT-4"],
  authors: [{ name: "PuterLLM Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PuterLLM",
  },
  openGraph: {
    type: "website",
    title: "PuterLLM - Zero-Config AI Platform",
    description: "Access 100+ AI models instantly with no API keys or sign-ups required.",
    siteName: "PuterLLM",
  },
  twitter: {
    card: "summary_large_image",
    title: "PuterLLM - Zero-Config AI Platform",
    description: "Access 100+ AI models instantly with no API keys or sign-ups required.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
