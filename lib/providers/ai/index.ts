import { aiClient, AI_MODELS } from "@/lib/ai/client";
import { logAIUsage } from "@/lib/ai/cost-tracker";

export interface AIProvider {
  name: string;
  generateText(prompt: string, systemPrompt?: string, model?: string): Promise<{ text: string; inputTokens: number; outputTokens: number }>;
  generateJSON<T>(prompt: string, systemPrompt?: string, model?: string): Promise<{ data: T; inputTokens: number; outputTokens: number }>;
}

export class OmniRouteAIProvider implements AIProvider {
  name = "OmniRoute";

  async generateText(
    prompt: string,
    systemPrompt?: string,
    model: string = AI_MODELS.DEFAULT
  ) {
    try {
      const response = await aiClient.chat.completions.create({
        model,
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user" as const, content: prompt },
        ],
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content || "";
      if (text && text.trim().length > 100) {
        const inputTokens = response.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
        const outputTokens = response.usage?.completion_tokens || Math.ceil(text.length / 4);

        await logAIUsage({
          provider: "omniroute",
          model,
          operation: "TEXT_GENERATION",
          inputTokens,
          outputTokens,
        });

        return { text, inputTokens, outputTokens };
      }
      throw new Error("Empty or insufficient response from LLM");
    } catch (error) {
      console.warn("OmniRoute Live API error, delegating to intelligent content synthesis engine:", error);
      throw error; // Throw so pipeline fallback can synthesize rich domain-specific article
    }
  }

  async generateJSON<T>(
    prompt: string,
    systemPrompt?: string,
    model: string = AI_MODELS.DEFAULT
  ): Promise<{ data: T; inputTokens: number; outputTokens: number }> {
    try {
      const response = await aiClient.chat.completions.create({
        model,
        messages: [
          ...(systemPrompt
            ? [{ role: "system" as const, content: `${systemPrompt}\nIMPORTANT: You must respond ONLY with valid JSON.` }]
            : [{ role: "system" as const, content: "Respond ONLY with a valid JSON object/array matching the request." }]),
          { role: "user" as const, content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const data = JSON.parse(raw) as T;
      const inputTokens = response.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
      const outputTokens = response.usage?.completion_tokens || Math.ceil(raw.length / 4);

      await logAIUsage({
        provider: "omniroute",
        model,
        operation: "JSON_GENERATION",
        inputTokens,
        outputTokens,
      });

      return { data, inputTokens, outputTokens };
    } catch (error) {
      console.warn("OmniRoute JSON generation error:", error);
      throw error;
    }
  }
}

export const defaultAIProvider = new OmniRouteAIProvider();
