const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const BookController = require('../../controllers/book-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('open')
      .setDescription('Opens a closed active wager to new bets.')
  ),

  async execute(interaction) {
    const { user } = interaction;
    const { ownerId } = BookController.latestWager;

    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator) && !user.id !== ownerId) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    try {
      const { responseCode } = await BookController.setWagerOpenState(true);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Opened Wager')
                .setColor(messageTypeColors.success)
                .setDescription('This wager can now accept new bets.')
            ]
          });
          break;
        }
        case responseCodes.book.setWagerOpenState.wrongState: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Already Open')
                .setColor(messageTypeColors.failure)
                .setDescription('This wager is already open.')
            ],
            ephemeral: true
          });
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
      console.log(error, 'wagerOpen.execute() -> BookController.setWagerOpenState()');
      interaction.editReply(messages.unknownError());
    }
  }
}