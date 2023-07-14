const { EmbedBuilder } = require('discord.js');
const {
  messageTypeColors,
  responseCodes,
  messages,
} = require('../../constants');
const { DocName } = require('../../constants/docs');
const DocController = require('../../controllers/doc-controller');

module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('reset')
      .setDescription('Resets the specified doc to its default value.')
      .addStringOption(option => (
        option
          .setName('name')
          .setDescription('The name of the doc to reset.')
          .addChoices(
            ...Object.values(DocName)
              .map(value => ({
                name: value,
                value: value,
              })),
          )
          .setRequired(true)
      ))
  ),

  async execute(interaction) {
    const { options } = interaction;
    const docNameKey = options.getString('name');

    try {
      const { responseCode } = await DocController.resetDoc(DocName[docNameKey]);

      switch (responseCode) {
      case responseCodes.success: {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Doc Reset')
              .setColor(messageTypeColors.success),
          ],
        });
        break;
      }
      default: {
        interaction.editReply(messages.unknownError());
      }
      }
    } catch (error) {
      console.log(error, 'docReset.execute -> DocController.resetDoc');
      interaction.editReply(messages.unknownError());
    }
  },
};
