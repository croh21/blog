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
