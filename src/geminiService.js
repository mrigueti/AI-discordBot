import axios from "axios";
import dotenv from "dotenv";
import { GEMMA_CONFIG, SEARCH_CONFIG } from "./config.js";

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

async function searchWeb(query) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1`,
      {
        params: {
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query,
          num: SEARCH_CONFIG.maxResults,
        },
      }
    );

    if (response.data.items) {
      return response.data.items.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
    }
    return [];
  } catch (error) {
    console.error("Erro na pesquisa web:", error.message);
    return [];
  }
}

export async function generateResponse(prompt, conversationHistory = []) {
  try {
    // Verificar se a mensagem pede por uma pesquisa web usando configurações centralizadas
    const isWebSearchRequest = SEARCH_CONFIG.searchTriggers.some((trigger) =>
      prompt.toLowerCase().includes(trigger)
    );

    let webSearchResults = [];
    if (isWebSearchRequest && process.env.GOOGLE_API_KEY) {
      webSearchResults = await searchWeb(prompt);
    }

    // Preparar o contexto da conversa para a API Gemini
    const conversationContext =
      conversationHistory.length > 0
        ? "\n\nHistórico da conversa:\n" +
          conversationHistory
            .map(
              (msg) =>
                `${msg.role === "user" ? "Usuário" : "Assistente"}: ${
                  msg.content
                }`
            )
            .join("\n")
        : "";

    // Formatar resultados da pesquisa web
    const formattedWebResults =
      webSearchResults.length > 0
        ? "\n\nResultados da pesquisa web:\n" +
          webSearchResults
            .map(
              (result) => `${result.title}\n${result.link}\n${result.snippet}\n`
            )
            .join("\n")
        : "";

    // Preparar o corpo da requisição usando configurações do Gemma 3n E4B
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt + formattedWebResults + conversationContext,
            },
          ],
        },
      ],
      generationConfig: GEMMA_CONFIG.generationConfig,
      safetySettings: GEMMA_CONFIG.safetySettings,
    };

    // Fazer uma requisição POST para a API Gemini usando Gemma 3n E4B
    const response = await axios.post(GEMMA_CONFIG.apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Verificar e retornar a resposta da API Gemini
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0]?.content?.parts?.[0]?.text
    ) {
      // Retornar resposta diretamente sem formatação de links
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.log(
        "Formato de resposta inesperado:",
        JSON.stringify(response.data, null, 2)
      );

      // Tentar extrair mensagem de erro se disponível
      if (response.data.error) {
        throw new Error(`Erro da API Gemini: ${response.data.error.message}`);
      }

      return "Desculpe, não consegui gerar uma resposta adequada. Tente reformular sua pergunta.";
    }
  } catch (error) {
    console.error(
      "Erro ao chamar a API Gemini (Gemma 3n E4B):",
      error.response ? error.response.data : error.message
    );

    // Tratamento de erros mais específico
    if (error.response?.status === 401) {
      throw new Error(
        "Erro de autenticação: Verifique sua chave da API Gemini"
      );
    } else if (error.response?.status === 403) {
      throw new Error(
        "Acesso negado: Verifique as permissões da sua chave da API"
      );
    } else if (error.response?.status === 429) {
      throw new Error(
        "Limite de requisições excedido: Tente novamente em alguns momentos"
      );
    } else {
      throw new Error("Falha ao gerar resposta da IA");
    }
  }
}
