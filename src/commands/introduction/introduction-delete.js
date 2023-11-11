const { PermissionFlagsBits } = require('discord.js');
const { messages } = require('../../constants');
const GuildController = require('../../controllers/guild-controller');
const { deleteIntroductionAutomatorButton } = require('./helpers');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('delete')
      .setDescription('Deletes the introduction automator')
  ),

  execute: async (interaction) => {
    const { memberPermissions } = interaction;

    if (!memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    const buttonWasDeleted = await deleteIntroductionAutomatorButton(interaction.guild);

    await GuildController.introductionAutomator.setChannelId(null);

    if (buttonWasDeleted) {
      interaction.editReply(`Introduction automator removed`);
    } else {
      interaction.editReply(`Could not find existing introduction automator`);
    }
  }
}