const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('delete')
      .setDescription('Deletes the target user\'s wallet.')
      .addUserOption(option => (
        option
          .setName('target')
          .setDescription('The user whose wallet to delete.')
          .setRequired(true)
      ))
  ),

  async execute(interaction) {
    await interaction.deferReply();
    const { user, options } = interaction;
    const target = options.getUser('target') || user;

    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    try {
      const { responseCode } = await EconomyController.deleteWallet(target.id);
      const walletOwnedByAuthor = target.id === user.id;
      const pronoun = walletOwnedByAuthor ? 'You' : 'They';
      const possessivePronoun = walletOwnedByAuthor ? 'Your' : 'Their';

      switch (responseCode) {
      case responseCodes.success: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Delete Wallet')
              .setColor(messageTypeColors.success)
              .setDescription(`${possessivePronoun} Bilaim wallet has been deleted.`),
          ],
        });
        break;
      }
      case responseCodes.doesntExist: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Doesn\'t Exist')
              .setColor(messageTypeColors.failure)
              .setDescription(`${pronoun} don't have a Bilaim wallet.`),
          ],
          ephemeral: true,
        });
        break;
      }
      default: {
        interaction.editReply(messages.unknownError());
      }
      }
    } catch (error) {
      console.log(error, 'WalletDelete.execute() -> EconomyController.deleteWallet()');
      interaction.editReply(messages.unknownError());
    }
  },
};
