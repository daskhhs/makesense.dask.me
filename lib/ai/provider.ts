export type AiProviderName = "gemini" | "groq" | "openrouter";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class MissingApiKeyError extends Error {
  provider: AiProviderName;

  constructor(provider: AiProviderName, envVar: string) {
    super(
      `No API key configured for ${provider}. Set ${envVar} in your environment, then try again.`
    );
    this.name = "MissingApiKeyError";
    this.provider = provider;
  }
}

export class AiProviderError extends Error {
  provider: AiProviderName;

  constructor(provider: AiProviderName, message: string) {
    super(message);
    this.name = "AiProviderError";
    this.provider = provider;
  }
}

export function getPreferredProvider(): AiProviderName {
  const raw = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim();
  if (raw === "groq" || raw === "openrouter" || raw === "gemini") {
    return raw;
  }
  return "gemini";
}

export function getAvailableProviders(): AiProviderName[] {
  const available: AiProviderName[] = [];
  if (process.env.GEMINI_API_KEY?.trim()) available.push("gemini");
  if (process.env.GROQ_API_KEY?.trim()) available.push("groq");
  if (process.env.OPENROUTER_API_KEY?.trim()) available.push("openrouter");
  return available;
}

export function resolveProvider(): AiProviderName | null {
  const preferred = getPreferredProvider();
  const available = getAvailableProviders();
  if (available.length === 0) return null;
  if (available.includes(preferred)) return preferred;
  return available[0];
}

export function providerEnvVar(provider: AiProviderName): string {
  switch (provider) {
    case "gemini":
      return "GEMINI_API_KEY";
    case "groq":
      return "GROQ_API_KEY";
    case "openrouter":
      return "OPENROUTER_API_KEY";
  }
}
