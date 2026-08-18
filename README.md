# Github AI Web Forge — Frontend Explorer

## ⚠️ Work in Progress

> **Still figuring itself out. We're just building, experimenting, chasing weird ideas, and seeing where they take us. Thanks for sticking around**

This project is still very much alive and under active development.
Some parts work. Some parts don't. Some parts work **until they suddenly don't**.

Expect:

* 🧪 Experimental ideas
* 🛠️ Things being rebuilt from scratch
* 💥 Occasional breakage
* 🌀 Features that may change direction
* ✨ Unexpectedly good ideas
* 🤷 The occasional *"well, that wasn't supposed to happen"*

The goal right now isn't to make everything look finished.

It's to **build, experiment, break things, learn, and keep making it better.**

> **If you're looking for something polished and predictable... this might be a little early. 😄**

---

Clean, fun, motion-rich UI for Github AI Web Forge experiment. Content + Layout = Website.

## Tech
- Vite + Bun + React 19 + TypeScript
- TailwindCSS v4
- Framer Motion
- AI SDK v5 (client-side demo)
- GitHub OAuth (PKCE) — local only

## Security Warning ⚠️
All keys are stored in **localStorage** for this local-only demo:
- GitHub OAuth Client ID
- GitHub access token
- AI provider API key

**Never use localStorage for secrets in production.** This is intentional for a fully frontend, local demo. Clear storage if you leave your machine.

## Run locally
```bash
bun install
bun run dev
```

## CI
GitHub Actions builds on push/PR: `.github/workflows/ci.yml`

## Features
- Explorer with instant content/layout switching, URL sync
- Live preview with 5 slots: intro, story, ideas, media, closing
- Edit mode with markdown editor and AI-assisted suggestions
- GitHub login UI (keys stored locally)
- Motion-polished, impeccable UI

## Notes
The core concept follows Github AI Web Forge spec. AI is added optionally for content suggestions; core rendering remains content+layout.
