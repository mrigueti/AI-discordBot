import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Configurações do modelo Gemma 3n E4B
export const GEMMA_CONFIG = {
  model: "gemma-3n-e4b-it",
  apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e4b-it:generateContent?key=${process.env.GEMINI_API_KEY}`,
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
    candidateCount: 1,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
};

// Configurações do bot Discord
export const BOT_CONFIG = {
  prefix: "!bot",
  maxHistoryMessages: 50,
  maxMessageLength: 2000,
  typingTimeout: 30000, // 30 segundos
};

// Configurações de pesquisa web
export const SEARCH_CONFIG = {
  maxResults: 5,
  searchTriggers: [
    "pesquise",
    "procure",
    "busque",
    "google",
    "pesquisa web",
    "mande link",
    "procure web",
  ],
};

// Configurações gerais
export const APP_CONFIG = {
  version: "2.0.0",
  model: "Gemma 3n E4B",
  supportedLanguages: ["pt-BR", "en-US"],
};

// Validar configurações essenciais
export function validateConfig() {
  const required = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  };

  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não configuradas: ${missing.join(
        ", "
      )}`
    );
  }

  return true;
}

export default {
  GEMMA_CONFIG,
  BOT_CONFIG,
  SEARCH_CONFIG,
  APP_CONFIG,
  validateConfig,
};
