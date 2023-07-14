const { EmbedBuilder } = require('discord.js');
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('send')
      .setDescription('Sends a specified amount of your Bilaim to another user.')
      .addUserOption(option => (
        option
          .setName('target')
          .setDescription('The user whose wallet to send the Bilaim to.')
          .setRequired(true)
      ))
      .addIntegerOption(option => (
        option
          .setName('value')
          .setDescription('The amount of your Bilaim to send.')
          .setRequired(true)
      ))
  ),

  async execute(interaction) {
    await interaction.deferReply();
    const { user, options, guild } = interaction;
    const targetUserId = options.getUser('target').id;
    const target = await guild.members.fetch(targetUserId);
    const value = options.getInteger('value');

    try {
      const { responseCode } = await EconomyController.transferCurrency(user.id, target.id, value);

      switch (responseCode) {
      case responseCodes.success: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Bilaim Transfer')
              .setColor(messageTypeColors.success)
              .setDescription(`You have transfered ${EconomyController.currencyEmoji} ${value}.`)
              .addFields({ name: 'To:', value: target.displayName }),
          ],
        });
        break;
      }
      case responseCodes.positiveValueNeeded: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Invalid Value')
              .setColor(messageTypeColors.failure)
              .setDescription('You can only send Bilaim in values greater than 0.'),
          ],
        });
        break;
      }
      case responseCodes.economy.noFromUser: {
        await interaction.editReply(messages.authorNoWallet());
        break;
      }
      case responseCodes.economy.noToUser: {
        await interaction.editReply(messages.targetNoWallet(target.displayName));
        break;
      }
      case responseCodes.economy.insufficientFunds: {
        await interaction.editReply(messages.insufficientFunds());
        break;
      }
      case responseCodes.economy.sameUser: {
        await interaction.editReply(messages.invalidTarget('You cannot send Bilaim to yourself.'));
        break;
      }
      default: {
        interaction.editReply(messages.unknownError());
      }
      }
    } catch (error) {
      console.log(error, 'walletSend.execute() -> EconomyController.transferCurrency()');
      interaction.editReply(messages.unknownError());
    }
  },
};
