const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { messageTypeColors } = require('../../constants');
const BookController = require('../../controllers/book-controller');

module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('reactivate')
      .setDescription('Reactivates an inactive wager.')
  ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    if (BookController.latestWager && !BookController.latestWager.isActive) {
      BookController.latestWager.isActive = true;
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Reactivate Wager')
            .setColor(messageTypeColors.success)
            .setDescription('The latest wager was reactivated.'),
        ],
      });
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('No Inactive Wager')
            .setColor(messageTypeColors.failure)
            .setDescription('There is no inactive wager to reactivate.'),
        ],
        ephemeral: true,
      });
    }
  },
};
