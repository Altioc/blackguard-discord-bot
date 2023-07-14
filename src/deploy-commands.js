const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];
const commandDirectories = fs.readdirSync(`${__dirname}/commands/`);

commandDirectories.forEach((file) => {
  const fileStat = fs.statSync(`${__dirname}/commands/${file}`);

  if (fileStat?.isDirectory()) {
    const commandFiles = fs.readdirSync(`${__dirname}/commands/${file}`);
    
    if (commandFiles?.includes('index.js')) {
      const command = require(`${__dirname}/commands/${file}/index.js`);
      commands.push(command.data.toJSON());
    }
  }
});

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => {
    console.log('Successfully registered application commands.');
    process.exit(0);
  })
  .catch(console.error);
