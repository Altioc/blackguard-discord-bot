const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { messageTypeColors, responseCodes, messages, currentLocationType } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('add')
      .setDescription('Adds a specified amount of Bilaim to the target\'s wallet.')
      .addUserOption(option => (
        option
          .setName('target')
          .setDescription('The user whose wallet to add Bilaim to.')
          .setRequired(true)
      ))
      .addIntegerOption(option => (
        option
          .setName('value')
          .setDescription('The amount of Bilaim to add.')
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
            .setDescription('You can only add Bilaim in values greater than 0.')
        ],
        ephemeral: true
      });
      return;
    }

    try {
      const { responseCode, value: newValue } = await EconomyController.modifyCurrency(target.id, value, addTarget);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Bilaim Added')
                .setColor(messageTypeColors.success)
                .setDescription(`${EconomyController.currencyEmoji} ${value} has been added.`)
                .addFields(
                  { name: 'To:', value: target.displayName },
                  { name: 'New balance:', value: `${newValue}` }
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
      console.log(error, 'walletAdd.execute() -> EconomyController.modifyCurrency()');
      interaction.editReply(messages.unknownError());
    }
  }
}