const { EmbedBuilder } = require('discord.js')
const {
  messageTypeColors,
  responseCodes,
  blackguardDbDocNames,
  messages
} = require('../../constants');
const DocController = require('../../controllers/doc-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('get')
      .setDescription('Saves the provided json object to the specified doc.')
      .addStringOption(option => (
        option
          .setName('name')
          .setDescription('The name of the doc to get.')
          .addChoices(
            ...Object.entries(blackguardDbDocNames)
              .map(([key, value]) => ({
                name: value,
                value: key
              }))
          )
          .setRequired(true)
      ))
      .addBooleanOption(option => (
        option
          .setName('config-only')
          .setDescription('Whether or not to get just the config or the whole doc object. Defaults to: false')
      ))
  ),

  async execute(interaction) {
    const { options } = interaction;
    const docNameKey = options.getString('name')
    const configOnly = !!options.getBoolean('config-only');

    try {
      const { responseCode, value } = await DocController.getDoc(docNameKey, configOnly);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Doc Results')
                .setColor(messageTypeColors.success)
                .setDescription(value)
            ]
          });
          break;
        }
        default: {
          interaction.editReply(messages.unknownError());
        }
      }
    } catch (error) {
      console.log(error, 'docGet.execute() -> DocController.getDoc()');
      interaction.editReply(messages.unknownError());
    }
  }
}