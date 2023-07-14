const { EmbedBuilder, time } = require('discord.js');
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('withdrawal')
      .setDescription('Starts the proccess of withdrawing a specified amount of Bilaim from your bank.')
      .addIntegerOption(option => (
        option
          .setName('amount')
          .setDescription('The amount of Bilaim to withdraw. If no amount provided then any active withdrawal status shown.')
      ))
  ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { user, options } = interaction;
    const amount = options.getInteger('amount');

    try {
      const { responseCode, value: responseValue } = await EconomyController.withdrawCurrency(user.id, amount);

      switch (responseCode) {
      case responseCodes.success: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Bilaim Withdrawal')
              .setColor(messageTypeColors.success)
              .setDescription(`You have initiated a withdrawal for ${EconomyController.currencyEmoji} ${amount}.`)
              .setFields([
                { name: 'Time until Withdrawal', value: time(new Date(responseValue), 'R')},
              ]),
          ],
        });
        break;
      }
      case responseCodes.economy.bank.existingWithdrawal: {
        const { amount, withdrawalTime } = responseValue;
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Existing Bilaim Withdrawal')
              .setColor(messageTypeColors.success)
              .setDescription(`You have an active withdrawal for ${EconomyController.currencyEmoji} ${amount}.`)
              .setFields([
                { name: 'Time until Withdrawal', value: time(new Date(withdrawalTime), 'R')},
              ]),
          ],
        });
        break;
      }
      case responseCodes.positiveValueNeeded: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Invalid Amount')
              .setColor(messageTypeColors.failure)
              .setDescription('You can only withdrawal Bilaim in amounts greater than 0.'),
          ],
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
      case responseCodes.economy.bank.withdrawalAmountUpdated: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Bilaim Withdrawal Updated')
              .setColor(messageTypeColors.success)
              .setDescription(`You have updated your withdrawal from ${EconomyController.currencyEmoji} ${responseValue} to ${EconomyController.currencyEmoji} ${amount}.`),
          ],
        });
        break;
      }
      case responseCodes.economy.bank.noExistingWithdrawal: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('No Active Withdrawal')
              .setColor(messageTypeColors.failure)
              .setDescription('You do not have an active withdrawal.'),
          ],
        });
        break;
      }
      default: {
        interaction.editReply(messages.unknownError());
      }
      }
    } catch (error) {
      console.log(error, 'walletWithdrawal.execute() -> EconomyController.withdrawCurrency()');
      interaction.editReply(messages.unknownError());
    }
  },
};
