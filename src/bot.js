const { Client } = require('discord.js');
const { token } = require('./config.json');
const handlers = require('./constants/interactionHandlers');
const fs = require('fs');

const client = new Client({ intents: 8 });

const loadHandlers = (directoriesPath, collection) => {
  const directories = fs.readdirSync(directoriesPath);
  directories.forEach((directory) => {
    const path = `${directoriesPath}/${directory}`;
    const directoryStat = fs.statSync(path);
  
    if (directoryStat?.isDirectory()) {
      const files = fs.readdirSync(path);
      
      if (files?.includes('index.js')) {
        const handler = require(`${path}/index.js`);
        collection.set(handler.data.name, handler);
      }
    }
  });
};

loadHandlers(`${__dirname}/commands`, handlers.commands);
loadHandlers(`${__dirname}/buttons`, handlers.buttons);
loadHandlers(`${__dirname}/modals`, handlers.modals);

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