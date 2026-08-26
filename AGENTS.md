# OmniRoute Gateway Rule

## Overview
All external AI / LLM requests, completions, agent scripts, and SDK client configurations within this project must route through the local **OmniRoute** gateway.

## Configuration & Standards
- **Base URL**: `http://localhost:20128/v1`
- **Protocol**: OpenAI-compatible API
- **Authentication**: Use environment variable `OPENAI_API_KEY` (or `OMNIROUTE_API_KEY`)
- **Default Models**: Prefer models configured and routed in OmniRoute dashboard (e.g., `gpt-4o`, `claude-3-7-sonnet`, `deepseek-chat`, etc.)

## Code Guidelines
- When initializing OpenAI, LangChain, LlamaIndex, or any other LLM client in Python/TypeScript/Node.js, always specify:
  ```python
  import os
  from openai import OpenAI

  client = OpenAI(
      base_url=os.getenv("OPENAI_BASE_URL", "http://localhost:20128/v1"),
      api_key=os.getenv("OPENAI_API_KEY", "omniroute-local")
  )
  ```
- Do not make direct outbound API calls to external LLM provider endpoints unless explicitly instructed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
