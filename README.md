# Ollama Chat

A responsive chat frontend built with React, TypeScript, Vite, and shadcn/ui that connects to a self-hosted LLM via [local-llm](https://github.com/QBERT18/local-llm).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [local-llm](https://github.com/QBERT18/local-llm) running and accessible (see below)

## Dependency: local-llm

This project **requires** the [QBERT18/local-llm](https://github.com/QBERT18/local-llm) backend to be running somewhere reachable by this frontend. The backend exposes a `/chat` endpoint that this app sends prompts to.

Since the LLM backend typically runs on a local machine (e.g. a Mac on your home network), you need to expose it via a tunnel like [ngrok](https://ngrok.com/) so that both local development and deployed versions (e.g. on Vercel) can reach it.

**Example:**

```bash
# On the machine running local-llm
ngrok http 8080
```

This gives you a public URL like `https://your-subdomain.ngrok-free.dev` that you'll use in the `.env` file below.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/QBERT18/ollama-chat.git
cd ollama-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the `.env` file

Create a `.env` file in the project root:

```env
VITE_OLLAMA_HOST=https://your-subdomain.ngrok-free.dev
VITE_CHAT_ENDPOINT=/chat
```

Replace the `VITE_OLLAMA_HOST` value with your actual ngrok URL (or the direct IP/port if running locally, e.g. `http://192.168.x.x:8080`).

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. The Vite dev server proxies `/chat` requests to the host defined in your `.env`, so there are no CORS issues.

### 5. Start chatting

Open the app in your browser and send a message. Make sure your [local-llm](https://github.com/QBERT18/local-llm) backend and ngrok tunnel are running.

## Deployment (Vercel)

The project includes a `vercel.json` with rewrites that proxy `/chat` to the ngrok URL. Update the `destination` in `vercel.json` if your ngrok URL changes.

Also set `VITE_CHAT_ENDPOINT=/chat` as an environment variable in your Vercel project settings.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (base-ui)
