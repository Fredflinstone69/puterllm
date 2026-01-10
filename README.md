# PuterLLM - Zero-Config LLM Interaction Platform

A powerful, fully client-side web application that provides instant access to 100+ AI models through Puter.js - no API keys, sign-ups, or backend server required.

![PuterLLM](https://img.shields.io/badge/PuterLLM-Zero--Config_AI-00ffff?style=for-the-badge&logo=sparkles&logoColor=white)

## Features

### Core Capabilities

- **100+ AI Models**: Access top LLMs including GPT-4o, Claude 3.5, Gemini, Llama 3, Mistral, and more
- **Zero Configuration**: No API keys, no sign-ups - just open and start chatting
- **Fully Client-Side**: All AI calls proxied through Puter.js - no backend required
- **Streaming Responses**: Real-time token streaming for responsive interactions

### Model Selection

- Searchable/filterable model selector
- Visual carousel for quick browsing
- Filter by: Vision support, Provider, Context window
- Auto-fallback to backup models on failure
- Model metadata display: name, context window, strengths

### Parameter Controls

- **Thinking Depth Slider (0-10)**: Single control that intelligently adjusts:
  - Temperature (0.0-2.0)
  - Top P (0.1-1.0)
  - Max Tokens (512-16384)
  - Auto-generates prompt prefixes (chain-of-thought, self-critique)
- Live preview of prompt modifications
- Custom system prompt support

### Prompt Engineering Toolkit

30+ pre-loaded templates across categories:

| Category | Templates |
|----------|-----------|
| Jailbreak | DAN Classic, Developer Mode, GODMODE |
| Adversarial | Suffix Injection, Hypothetical Framing, PAIR Template |
| Encoding | Base64, ROT13, Leetspeak, Homoglyphs |
| Policy Wrap | Academic Framing, Security Research, Educational Context |
| Creative | Story Continuation, Expert Interview, Time Traveler |
| System Prompt | Unrestricted Assistant, Expert Persona, Debug Mode |
| Utility | Step-by-Step, ELI5, Pros & Cons, Code Review |
| Advanced | Chain of Thought, Self-Critique, Multi-Perspective |

**Quick Actions**:
- Apply Max Depth
- Obfuscate Prompt (Base64/ROT13/Leetspeak/Homoglyphs)
- Create custom templates
- Save/load templates via Puter.fs

### Chat Interface

- Markdown rendering with syntax highlighting (Prism.js)
- Code block copy functionality
- Message actions: Copy, Delete, Regenerate, Branch
- Conversation branching support
- Auto-scroll with streaming indicator

### Multimodal Support

- **Image Upload**: Drag & drop or paste images
- **Vision Analysis**: Use vision-capable models for image understanding
- **Text-to-Image**: Generate images from text prompts
- **Text-to-Speech**: Listen to AI responses

### History & Persistence

- Conversation history sidebar
- Group by: Today, Yesterday, This Week, Older
- Rename, delete, export/import conversations
- Local storage persistence
- Optional Puter cloud sync (when signed in)

### UI/UX

- **Theme**: Dark cyberpunk/neon-futurist
- **Effects**: Glassmorphism, subtle glitch animations, neon glows
- **Animations**: Smooth Framer Motion transitions
- **Responsive**: Works on desktop, tablet, and mobile
- **PWA**: Installable as Progressive Web App

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Puter.js v2** | Zero-config LLM access & cloud storage |
| **Next.js 15+** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **Framer Motion** | Animations |
| **Zustand** | State management |
| **Prism.js** | Code syntax highlighting |
| **Lucide Icons** | Icon library |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/puterllm.git
cd puterllm

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send message |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+Shift+T` | Toggle template panel |
| `Ctrl+Shift+S` | Open settings |
| `Ctrl+Shift+N` | New conversation |
| `Escape` | Close modals |

## Model IDs Reference

### Top Models (by Puter.js availability)

| Model | ID | Strengths |
|-------|-----|-----------|
| GPT-4o | `gpt-4o` | Vision, Reasoning, Quality |
| GPT-4o Mini | `gpt-4o-mini` | Fast, Cost-effective |
| Claude 3.5 Sonnet | `claude-3-5-sonnet` | Reasoning, Coding, Quality |
| Claude 3.5 Haiku | `claude-3-5-haiku` | Fast, Balanced |
| Gemini 2.0 Flash | `gemini-2.0-flash` | Fast, Multimodal |
| Gemini 1.5 Pro | `gemini-1.5-pro` | Long context, Quality |
| o1 | `o1` | Advanced reasoning |
| o1-mini | `o1-mini` | Fast reasoning |
| Llama 3.3 70B | `llama-3.3-70b` | Open source, Quality |
| Mistral Large | `mistral-large` | Multilingual, Balanced |
| DeepSeek V3 | `deepseek-v3` | Coding, Cost-effective |
| Codestral | `codestral` | Code generation |

*Note: Model availability depends on Puter.js. Use `puter.ai.listModels()` for current list.*

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles & theme
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Slider.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── chat/              # Chat-related components
│   │   ├── ChatContainer.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   ├── models/            # Model selection
│   │   └── ModelSelector.tsx
│   ├── templates/         # Prompt templates
│   │   └── TemplatePanel.tsx
│   ├── settings/          # Settings & parameters
│   │   ├── ParameterControls.tsx
│   │   └── SettingsModal.tsx
│   └── layout/            # Layout components
│       ├── MainLayout.tsx
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── LoadingScreen.tsx
├── hooks/
│   └── usePuter.ts        # Puter.js integration hook
├── store/
│   └── index.ts           # Zustand store & templates
├── lib/
│   └── utils.ts           # Utility functions
├── types/
│   └── puter.d.ts         # Puter.js TypeScript types
└── public/
    ├── manifest.json      # PWA manifest
    └── icon.svg           # App icon
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/puterllm)

### Other Platforms

The app is a static Next.js export and can be deployed to any static hosting:

```bash
npm run build
# Deploy the `out` directory
```

Works with: Netlify, Cloudflare Pages, GitHub Pages, AWS S3, etc.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Puter.js](https://puter.com) - Zero-config AI infrastructure
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://framer.com/motion) - Animations
- [Lucide](https://lucide.dev) - Icons

---

Built with the power of Puter.js for the opencode.com team.
