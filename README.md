# FireCracker

FireCracker is a modern, responsive ChatGPT-style web app built with React, Next.js 13, ShadCN, and Tailwind CSS. It features robust conversation management, model selection, real-time streaming, and a beautiful, accessible UI. FireCracker is designed for extensibility and developer productivity, and connects to the Fireworks API for fast, scalable, OpenAI-compatible LLM chat.

### Hosted on Vercel - [https://firecracker-gpt.vercel.app/](https://firecracker-gpt.vercel.app/)

## Features

- Responsive, accessible chat UI
- Conversation and Chat Model selection
- New Conversation
- Delete Conversation
- Markdown Response Rendering - Handles markdown, code blocks, tables, anchors and images
- Think Tag Stripping - Automatically removes think tags from responses
- Fireworks API integration for fast, scalable LLM chat
- Conversation management with local storage
- Real-time streaming with stats (response time, tokens/sec) & Loading indicators
- Copy-to-clipboard for assistant messages
- Dark/Light modes, defaults to Dark
- Modern, modular codebase

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/navaneethr/firecracker.git
cd firecracker
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

To connect to the Fireworks API, create a `.env.local` file in the project root and add your API key:

```env
FIREWORKS_API_KEY=your_fireworks_api_key_here
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Main app pages and layout
- `components/` - UI components (navbar, chat, etc)
- `context/` - State providers
- `lib/` - Utilities and API helpers
- `public/` - Static assets
- `styles/` - Tailwind/global CSS
- `types/` - TypeScript types
