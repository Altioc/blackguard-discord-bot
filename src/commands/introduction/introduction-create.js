const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { messages } = require('../../constants');
const GuildController = require('../../controllers/guild-controller');
const { 
  createIntroductionAutomatorButton,
  deleteIntroductionAutomatorButton
} = require('./helpers');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('create')
      .setDescription('Creates an introduction automator')
      .addChannelOption(option => (
        option
          .setName('channel')
          .setDescription('The channel to put the button in.')
          .addChannelTypes(ChannelType.GuildText))
          .setRequired(true)
      )),

  execute: async (interaction) => {
    const { memberPermissions, options } = interaction;
    const channel = options.getChannel('channel');

    if (!memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    await deleteIntroductionAutomatorButton(interaction.guild);
  
    await createIntroductionAutomatorButton(channel);

    await GuildController.introductionAutomator.setChannelId(channel.id);

    interaction.editReply(`Introduction automator added to ${channel}`);
  }
}