const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const allCommands = require('./constants/command-handlers');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ],
});

const commandsPath = `${__dirname}/commands`;
const commandDirectories = fs.readdirSync(commandsPath);
commandDirectories.forEach((commandDirectory) => {
  const directoryStat = fs.statSync(`${commandsPath}/${commandDirectory}`);

  if (directoryStat?.isDirectory()) {
    const commandFiles = fs.readdirSync(`${commandsPath}/${commandDirectory}`);
    
    if (commandFiles?.includes('index.js')) {
      const command = require(`${commandsPath}/${commandDirectory}/index.js`);
      allCommands.set(command.data.name, command);
    }
  }
});

const eventsPath = `${__dirname}/events`;
const javascriptFilesOnly = file => file.endsWith('.js');
const eventFiles = fs.readdirSync(eventsPath).filter(javascriptFilesOnly);
const executeEventHandler = eventHandler => (...args) => eventHandler.execute(...args);
eventFiles.forEach((file) => {
  const filePath = `${eventsPath}/${file}`;
  const eventHandler = require(filePath);

  if (eventHandler.once) {
    client.once(eventHandler.name, executeEventHandler(eventHandler));
  } else {
    client.on(eventHandler.name, executeEventHandler(eventHandler));
  }
});

client.login(token);
