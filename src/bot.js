const { Client, Collection } = require('discord.js');
const { token } = require('./config.json');
const ids = require('./ids.json');
const fs = require('fs');

const client = new Client({ intents: 8 });

client.commands = new Collection();

const commandsPath = `${__dirname}/commands`;
const commandDirectories = fs.readdirSync(commandsPath);
commandDirectories.forEach((commandDirectory) => {
  const directoryStat = fs.statSync(`${commandsPath}/${commandDirectory}`);

  if (directoryStat?.isDirectory()) {
    const commandFiles = fs.readdirSync(`${commandsPath}/${commandDirectory}`);
    
    if (commandFiles?.includes('index.js')) {
      const command = require(`${commandsPath}/${commandDirectory}/index.js`);
      client.commands.set(command.data.name, command);
    }
  }
});

client.once('ready', (clientObject) => {
  console.log(`Ready! Logged in as ${clientObject.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  await interaction.guild.fetch();
  const member = await interaction.member.fetch(true);

  const canAccessCommands = ids.requiredRoles.some((roleId) => (
    member.roles.cache.has(roleId)
  ));

  if (!canAccessCommands) {
    await interaction.reply({
      content: 'Must be a Blackguard member.',
      ephemeral: true
    });
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error, 'interactionCreate->command.execute');
  }
});

client.login(token);