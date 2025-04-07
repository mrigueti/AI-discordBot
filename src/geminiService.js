import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

async function searchWeb(query) {
  try {
    const response = await axios.get(`https://www.googleapis.com/customsearch/v1`, {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: 5
      }
    });

    if (response.data.items) {
      return response.data.items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      }));
    }
    return [];
  } catch (error) {
    console.error('Erro na pesquisa web:', error.message);
    return [];
  }
}

// Formatar links para serem clicáveis no Discord
function formatClickableLinks(text) {
  // Regex para identificar URLs - padrão melhorado para capturar mais formatos de URL
  const urlRegex = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/gi;
  
  // Formatar o texto para preservar quebras de linha e formatação do Discord
  let formattedText = text
    // Substituir URLs por links formatados para markdown do Discord
    .replace(urlRegex, url => {
      // Remover parênteses do final da URL se existirem
      const cleanUrl = url.replace(/[()]$/, '');
      return `<${cleanUrl}>`;
    })
    // Garantir que blocos de código sejam preservados
    .replace(/```(.*?)```/gs, match => match)
    // Garantir que quebras de linha sejam preservadas
    .replace(/\n/g, '\n\n');

  return formattedText.trim();
}

export async function generateResponse(prompt, conversationHistory = []) {
  try {
    // Verificar se a mensagem pede por uma pesquisa web
    const isWebSearchRequest = prompt.toLowerCase().includes('pesquise') || 
                              prompt.toLowerCase().includes('procure') || 
                              prompt.toLowerCase().includes('busque') ||
                              prompt.toLowerCase().includes('google') ||
                              prompt.toLowerCase().includes('pesquisa web') ||
                              prompt.toLowerCase().includes('mande link') ||
                              prompt.toLowerCase().includes('procure web');
                              

    let webSearchResults = [];
    if (isWebSearchRequest) {
      webSearchResults = await searchWeb(prompt);
    }

    // Preparar o contexto da conversa para a API Gemini
    const conversationContext = conversationHistory.length > 0 ?
      "\n\nHistórico da conversa:\n" + 
      conversationHistory.map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`).join('\n')
      : '';

    // Formatar resultados da pesquisa web com links clicáveis
    const formattedWebResults = webSearchResults.length > 0 ?
      '\n\nResultados da pesquisa web:\n' + 
      webSearchResults.map(result => 
        `${result.title}\n<${result.link}>\n${result.snippet}\n`
      ).join('\n')
      : '';

    // Preparar o corpo da requisição conforme a documentação da API Gemini
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt + formattedWebResults + conversationContext
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1030
      }
    };

    // Fazer uma requisição POST para a API Gemini
    const response = await axios.post(
      process.env.gemini_api_url,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Verificar e retornar a resposta da API Gemini
    if (response.data && response.data.candidates && response.data.candidates[0].content.parts[0].text) {
      // Formatar links na resposta para serem clicáveis
      return formatClickableLinks(response.data.candidates[0].content.parts[0].text);
    } else {
      console.log("Formato de resposta inesperado:", response.data);
      return JSON.stringify(response.data);
    }
  } catch (error) {
    console.error('Erro ao chamar a API Gemini:', error.response ? error.response.data : error.message);
    throw new Error('Falha ao gerar resposta da IA');
  }
}
