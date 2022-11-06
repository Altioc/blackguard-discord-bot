const { EmbedBuilder } = require('discord.js')
const {
  messageTypeColors,
  responseCodes,
  betOptions,
  messages
} = require('../../constants');
const BookController = require('../../controllers/book-controller');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('bet')
      .setDescription('Places a bet on the current wager for a given option and amount.')
      .addIntegerOption(option => (
        option
          .setName('value')
          .setDescription('The amount of Bilaim to bet.')
          .setRequired(true)
      ))
      .addStringOption(option => (
        option
          .setName('option')
          .setDescription('What outcome to place your bet on.')
          .addChoices(
            ...Object.entries(betOptions)
              .map(([key, value]) => ({
                name: value,
                value: key
              }))
          )
          .setRequired(true)
      ))
  ),

  async execute(interaction) {
    const { user, options } = interaction;
    const value = options.getInteger('value');
    const option = options.getString('option');

    try {
      const { responseCode, value: finalBetAmount } = await BookController.bet(user.id, value, option);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('New Bet')
                .setColor(messageTypeColors.success)
                .setDescription('You have placed a bet')
                .addFields(
                  { name: 'Value:', value: `${EconomyController.currencyEmoji} ${finalBetAmount}` },
                  { name: 'Option:', value: `"${option}"` }
                )
            ]
          });
          break;
        }
        case responseCodes.doesntExist: {
          await interaction.editReply(messages.authorNoWallet());
          break;
        }
        case responseCodes.economy.insufficientFunds: {
          await interaction.editReply(messages.insufficientFunds());
          break;
        }
        case responseCodes.alreadyExists: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Existing Bet')
                .setColor(messageTypeColors.failure)
                .setDescription('You have already placed a bet on this wager and you cannot modify it.')
            ],
            ephemeral: true
          });
          break;
        }
        case responseCodes.book.ownWager: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Invalid Bet')
                .setColor(messageTypeColors.failure)
                .setDescription('You may not bet on your own wager.')
            ],
            ephemeral: true
          });
          break;
        }
        case responseCodes.book.noOpenWager: {
          await interaction.editReply(messages.wagerClosed('The wager is closed and is not accepting new bets.'));
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
      console.log(error, 'wagerBet.execute() -> BookController.bet()');
      interaction.editReply(messages.unknownError());
    }
  }
}