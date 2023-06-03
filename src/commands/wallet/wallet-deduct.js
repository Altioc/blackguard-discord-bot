const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { messageTypeColors, responseCodes, messages, currentLocationType } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('deduct')
      .setDescription('Deducts a specified amount of Bilaim from a user\'s wallet.')
      .addUserOption(option => (
        option
          .setName('target')
          .setDescription('The user whose wallet to deduct the Bilaim from.')
          .setRequired(true)
      ))
      .addIntegerOption(option => (
        option
          .setName('value')
          .setDescription('The amount of Bilaim to deduct.')
          .setRequired(true)
      ))
      .addBooleanOption(option => (
        option
          .setName('bank')
          .setDescription('Whether or not to add money to the users bank instead of their wallet. Defaults to false.')
      ))
  ),

  async execute(interaction) {
    await interaction.deferReply();
    const { options, guild } = interaction;
    const targetUserId = options.getUser('target').id;
    const target = await guild.members.fetch(targetUserId);
    const value = options.getInteger('value');
    const toBank = options.getBoolean('bank');

    const addTarget = toBank ? currentLocationType.Bank : currentLocationType.Wallet;

    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    if (value <= 0) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Invalid Value')
            .setColor(messageTypeColors.failure)
            .setDescription('You can only deduct Bilaim in values greater than 0.')
        ],
        ephemeral: true
      });
      return;
    }

    try {
      const { responseCode, value: newValue } = await EconomyController.modifyCurrency(target.id, -value, addTarget);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Bilaim Deducted')
                .setColor(messageTypeColors.success)
                .setDescription(`${EconomyController.currencyEmoji} ${value} has been deducted.`)
                .addFields(
                  { name: 'From:', value: target.displayName },
                  { name:'New balance:', value: `${newValue}` }
                )
            ]
          });
          break;
        }
        case responseCodes.userDoesNotExist: {
          await interaction.editReply(messages.targetNoWallet(target.displayName));
          break;
        }
        default: {
          interaction.editReply(messages.unknownError());
        }
      }
    } catch (error) {
      console.log(error, 'walletDeduct.execute() -> EconomyController.modifyCurrency()');
      interaction.editReply(messages.unknownError());
    }
  }
}