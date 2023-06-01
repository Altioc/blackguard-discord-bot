const { EmbedBuilder, PermissionFlagsBits, } = require('discord.js')
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('create')
      .setDescription('Creates a new wallet for the target user or the author if no target specified.')
      .addUserOption(option => (
        option
          .setName('target')
          .setDescription('The user or the author if ommitted.')
      ))
  ),

  async execute(interaction) {
    const { user, options } = interaction;
    const target = options.getUser('target') || user;

    if (target.id !== user.id && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    try {
      const { responseCode } = await EconomyController.createWallet(target.id);

      const walletOwnedByUser = target.id === user.id;
      const pronoun = walletOwnedByUser ? 'You' : 'They';
      const possessivePronoun = walletOwnedByUser ? 'Your' : 'Their';

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Create Wallet')
                .setColor(messageTypeColors.success)
                .setDescription(`${possessivePronoun} Bilaim wallet has been created.`)
            ]
          });
          break;
        }
        case responseCodes.alreadyExists: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Already Exists')
                .setColor(messageTypeColors.failure)
                .setDescription(`${pronoun} already have a Bilaim wallet.`)
            ],
            ephemeral: true
          });
          break;
        }
        default: {
          interaction.editReply(messages.unknownError());
        }
      }
    } catch (error) {
      console.log(error, 'leaderboard.execute() -> EconomyController.getAllWallets()');
      interaction.editReply(messages.unknownError());
    }
  }
}