import OpenAI from "openai";

/**
 * OmniRoute Gateway compliant LLM client
 * Follows AGENTS.md rule: All LLM requests route through OmniRoute local gateway
 */
const baseURL = process.env.OPENAI_BASE_URL || "http://localhost:20128/v1";
const apiKey = process.env.OPENAI_API_KEY || "omniroute-local";

export const aiClient = new OpenAI({
  baseURL,
  apiKey,
});

export const AI_MODELS = {
  DEFAULT: process.env.DEFAULT_AI_MODEL || "gpt-4o",
  FAST: process.env.FAST_AI_MODEL || "gpt-4o-mini",
  REASONING: "claude-3-7-sonnet",
};
