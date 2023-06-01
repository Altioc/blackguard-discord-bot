const { PermissionFlagsBits } = require('discord.js');
const { messages } = require('../../constants');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('update')
      .setDescription('Update a role selector')
  ),

  async execute(interaction) {
    const { memberPermissions } = interaction;

    if (!memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    interaction.editReply(messages.unknownError());
  }
}