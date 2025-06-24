# Discord Bot with Gemma 3n E4B

<div align="center">
  <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"/>
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini API"/>
  <img src="https://img.shields.io/badge/Gemma_3n_E4B-FF6B6B?style=for-the-badge&logo=google&logoColor=white" alt="Gemma 3n E4B"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
</div>

### 📝 Description

This project is a Discord bot integrated with Google's **Gemma 3n E4B** AI model, offering advanced conversational capabilities and web information access. The bot maintains conversation context and provides intelligent, up-to-date responses.

### ✨ Features

- **Gemma 3n E4B Model**: Uses Google's advanced AI model
- Full Discord.js integration
- Internet access for up-to-date information
- Customizable command system
- Conversation context management for natural, continuous dialogues
- Integrated web search with clickable links
- Advanced security settings
- Robust error handling

### 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/mrigueti/AI-discordBot.git
cd AI-discordBot
```

2. Install dependencies:

```bash
npm install
```

3. Configure the `.env` file with your credentials:

```env
DISCORD_TOKEN=your_discord_token
GEMINI_API_KEY=your_gemini_api_key
```

### ⚙️ Configuration

1. **Create a Discord application**:

   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application and get the bot token

2. **Get Gemini API key**:

   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create an API key for Gemini

3. **Invite the bot to your server**:
   - Use the OAuth2 URL generated in the Discord developer portal

### 💻 Usage

Run the bot with:

```bash
npm start
```

**Basic commands**:

- `!bot [message]` - Start a conversation with context
- `!bot search [topic]` - Search for information on the web
- `!bot explain [concept]` - Get detailed explanations

**Examples**:

```
!bot Hello, how are you?
!bot search latest AI news
!bot explain how the Gemma 3n E4B model works
```

### 🤖 Special Features

The bot automatically detects web search requests using keywords like:

- "search", "find", "look for"
- "google", "web search"
- "send link", "search web"

### 📋 Requirements

- Node.js 16.x or higher
- Internet connection
- Discord account
- Access to Gemini API
- (Optional) Google Custom Search API for web search

### 🔧 Gemma 3n E4B Model Settings

The bot is optimized for the **Gemma 3n E4B** model with the following configurations:

- **Temperature**: 0.7 (balance between creativity and precision)
- **Top K**: 40
- **Top P**: 0.95
- **Max Output Tokens**: 2048
- **Safety Filters**: Configured to block inappropriate content
- **Model**: `gemma-2-9b-it` (Gemma 3n E4B Instruction Tuned)

## ⚠️ Discord Permissions and Configuration

### Discord Developer Portal - Intents

For your bot to work properly, you need to enable the appropriate "Intents" in the Discord Developer Portal:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. In `OAuth2` the "Bot" section, scroll down to find "Privileged Gateway Intents"
4. You will likely need to enable:
   - **MESSAGE CONTENT INTENT** - Allows the bot to read message content (essential for commands)
   - **SERVER MEMBERS INTENT** - If your bot needs to access information about server members
   - **PRESENCE INTENT** - If your bot needs to detect user presence status

### OAuth2 Permissions

When inviting the bot to a server, you need to specify the correct permissions:

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Under "SCOPES", select `bot` and `applications.commands`
3. Under "BOT PERMISSIONS", select the necessary permissions:

   - `Send Messages`
   - `Read Message History`
   - `Read Messages/View Channels`
   - `Embed Links` (if your bot sends embeds)
   - Any other specific permissions your bot might need

4. Use the generated URL in your browser to invite the bot to your server

### About discord.js

This project uses [discord.js](https://discord.js.org/), a powerful Node.js library to interact with the Discord API. Important points:

- **Compatible version**: This project requires discord.js v14+ which works with the latest Discord API
- **Node.js**: Make sure to use Node.js 16.x or higher (as per library requirements)
- **Code structure**: This template implements a modular approach to facilitate bot expansion
