const { Client } = require('discord.js');
const { token } = require('./config.json');
const allCommands = require('./constants/commandHandlers');
const fs = require('fs');

const client = new Client({ intents: 8 });

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
const executeEventHandler = (eventHandler) => (...args) => eventHandler.execute(...args);
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