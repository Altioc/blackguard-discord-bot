const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const BookController = require('../../controllers/book-controller');

module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('close')
      .setDescription('Closes an active wager to new bets.')
  ),

  async execute(interaction) {
    const { user } = interaction;
    const { ownerId } = BookController.latestWager;

    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator) && user.id !== ownerId) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    try {
      const { responseCode } = await BookController.setWagerOpenState(false);

      switch (responseCode) {
      case responseCodes.success: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Closed Wager')
              .setColor(messageTypeColors.success)
              .setDescription('This wager can no longer accept bets.'),
          ],
        });
        break;
      }
      case responseCodes.book.setWagerOpenState.wrongState: {
        await interaction.editReply(messages.wagerClosed('This wager is already closed.'));
        break;
      }
      case responseCodes.book.noActiveWager: {
        await interaction.editReply(messages.noActiveWager());
        break;
      }
      default: {
        interaction.editReply(messages.unknownError());
      }
      }
    } catch (error) {
      console.log(error, 'wagerClose.execute() -> BookController.setWagerOpenState()');
      interaction.editReply(messages.unknownError());
    }
  },
};
