const { EmbedBuilder } = require('discord.js')
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('deposit')
      .setDescription('Deposits a specified amount of Bilaim to your bank.')
      .addStringOption(option => (
        option
          .setName('amount')
          .setDescription('The amount of Bilaim to deposit or "max" for the max you\'re allowed to deposit.')
          .setRequired(true)
      ))
  ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { user, options } = interaction;
    const amount = options.getString('amount');

    try {
      const { responseCode, value: responseValue } = await EconomyController.depositCurrency(user.id, amount);
      const { storableValueRatio } = EconomyController.bank;

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Bilaim Deposit')
                .setColor(messageTypeColors.success)
                .setDescription(`You have deposited ${EconomyController.currencyEmoji} ${responseValue}.`)
            ]
          });
          break;
        }
        case responseCode.invalidInput: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Invalid Deposit Amount')
                .setColor(messageTypeColors.failure)
                .setDescription(`The provided deposit amount: ${value} is not a postive integer or the word "max".`)
            ]
          });
          break;
        }
        case responseCodes.positiveValueNeeded: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Invalid Amount')
                .setColor(messageTypeColors.failure)
                .setDescription('You can only deposit Bilaim in amounts greater than 0.')
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
        case responseCodes.valueTooHigh: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Deposit Amount Too High')
                .setColor(messageTypeColors.failure)
                .setDescription(`You cannot deposit more than ${EconomyController.currencyEmoji} ${responseValue}. The current bank deposit ratio is: ${storableValueRatio}`)
            ]
          })
          break;
        }
        default: {
          interaction.editReply(messages.unknownError());
        }
      }
    } catch (error) {
      console.log(error, 'walletDeposit.execute() -> EconomyController.depositCurrency()');
      interaction.editReply(messages.unknownError());
    }
  }
}