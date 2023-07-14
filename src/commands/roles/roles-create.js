const { 
  ActionRowBuilder, 
  PermissionFlagsBits, 
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { messages } = require('../../constants');
const persistentUiController = require('../../controllers/persistent-ui-controller');
const { MultiSelectView } = require('../../views/multi-select');

module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('create')
      .setDescription('Creates a role selector')
      .addStringOption(option => (
        option
          .setName('title')
          .setDescription('The title for the role selector post.')
          .setRequired(true)
      ))
      .addBooleanOption(option => (
        option
          .setName('multiselect')
          .setDescription('Whether or not to allow users to select multiple roles. Defaults to: false')
      ))
  ),

  async execute(interaction) {
    const { memberPermissions, options, guild } = interaction;
    const title = options.getString('title');
    const canSelectMultiple = options.getBoolean('multiselect');

    if (!memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    const roles = await guild.roles.fetch();
    const allRoles = roles.map(({ name, id, icon }) => ({ name, id, icon, selected: false }));
    allRoles[0].icon = '<:keklops:1048234963876716575>';
    
    new MultiSelectView(interaction, {
      options: allRoles,
      placeholder: 'Select roles',
      ephemeral: true,
    });
  },
};
