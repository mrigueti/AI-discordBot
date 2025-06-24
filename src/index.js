// modulos necessarios
import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { generateResponse } from "./geminiService.js";
import { BOT_CONFIG, APP_CONFIG, validateConfig } from "./config.js";

// carregar variaveis de ambiente
dotenv.config();

// Validar configurações antes de iniciar
try {
  validateConfig();
  console.log(
    `🤖 Iniciando ${APP_CONFIG.model} Discord Bot v${APP_CONFIG.version}`
  );
} catch (error) {
  console.error("❌ Erro de configuração:", error.message);
  console.log('💡 Execute "npm run test" para verificar sua configuração');
  process.exit(1);
}

// criar cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Evento executado quando o bot está online
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Bot conectado como ${readyClient.user.tag}!`);
  console.log(`🧠 Usando modelo: ${APP_CONFIG.model}`);
  console.log(`📝 Prefixo de comando: ${BOT_CONFIG.prefix}`);
  console.log("🚀 Bot pronto para receber comandos!");
});

// Armazenar histórico de conversas por canal
const conversationHistory = new Map();

// Função para limpar histórico antigo (usar configuração)
function cleanOldHistory(channelId) {
  const history = conversationHistory.get(channelId) || [];
  if (history.length > BOT_CONFIG.maxHistoryMessages) {
    history.splice(0, history.length - BOT_CONFIG.maxHistoryMessages);
    conversationHistory.set(channelId, history);
  }
}

// Evento para processar mensagens
client.on(Events.MessageCreate, async (message) => {
  // Ignorar mensagens de bots e mensagens que não começam com o prefixo
  if (message.author.bot || !message.content.startsWith(BOT_CONFIG.prefix))
    return;

  // Obter o conteúdo da mensagem sem o prefixo
  const prompt = message.content.slice(BOT_CONFIG.prefix.length).trim();

  if (!prompt) {
    message.reply(
      `Por favor, digite uma pergunta após o comando ${BOT_CONFIG.prefix}`
    );
    return;
  }

  try {
    // Enviar indicação de digitação enquanto processa
    await message.channel.sendTyping();

    // Obter histórico do canal
    const channelHistory = conversationHistory.get(message.channel.id) || [];

    // Adicionar mensagem atual ao histórico
    channelHistory.push({
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
    });

    console.log(`Processando pergunta: "${prompt}"`);
    console.log(`📊 Histórico do canal: ${channelHistory.length} mensagens`);

    // Obter resposta da API gemini com contexto do histórico
    const response = await generateResponse(prompt, channelHistory);

    // Adicionar resposta ao histórico
    channelHistory.push({
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    });

    // Atualizar histórico no Map
    conversationHistory.set(message.channel.id, channelHistory);

    // Limpar histórico antigo
    cleanOldHistory(message.channel.id);

    // Verificar se a resposta é muito longa para um único envio
    if (response.length > BOT_CONFIG.maxMessageLength) {
      // Dividir em múltiplas mensagens
      const chunks =
        response.match(
          new RegExp(`(.|\n){1,${BOT_CONFIG.maxMessageLength}}`, "g")
        ) || [];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(response);
    }
  } catch (error) {
    console.error("❌ Erro ao processar a solicitação:", error);
    const errorMessage =
      error.message ||
      "Desculpe, ocorreu um erro ao processar sua solicitação.";
    message.reply(`⚠️ ${errorMessage}`);
  }
});

// Tratamento de erros globais
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Rejeição não tratada em:", promise, "motivo:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Exceção não capturada:", error);
  process.exit(1);
});

// Conectar o bot usando o token
console.log("🔗 Conectando ao Discord...");
client.login(process.env.DISCORD_TOKEN);
