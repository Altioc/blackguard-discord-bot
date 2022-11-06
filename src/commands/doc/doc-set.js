const { EmbedBuilder } = require('discord.js')
const {
  messageTypeColors,
  responseCodes,
  blackguardDbDocNames,
  messages
} = require('../../constants');
const DocController = require('../../controllers/doc-controller')

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('set')
      .setDescription('Saves the provided json object to the specified doc.')
      .addStringOption(option => (
        option
          .setName('name')
          .setDescription('The name of the doc to save to.')
          .addChoices(
            ...Object.entries(blackguardDbDocNames)
              .map(([key, value]) => ({
                name: value,
                value: key
              }))
          )
          .setRequired(true)
      ))
      .addStringOption(option => (
        option
          .setName('value')
          .setDescription('The new json to save.')
          .setRequired(true)
      ))
      .addBooleanOption(option => (
        option
          .setName('config-only')
          .setDescription('Whether or not to set just the config or the whole doc object. Defaults to: false')
      ))
  ),

  async execute(interaction) {
    const { options } = interaction;
    const docNameKey = options.getString('name');
    const value = options.getString('value');
    const configOnly = !!options.getBoolean('config-only');

    let valueAsJson;

    try {
      valueAsJson = JSON.parse(value.replace(/\n| /g, ''));
    } catch {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Invalid JSON')
            .setColor(messageTypeColors.success)
            .setDescription('You must provide a valid JSON when using the set command.')
        ]
      });
      return;
    }

    try {
      const { responseCode } = await DocController.setDoc(docNameKey, valueAsJson, configOnly);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Doc Updated')
                .setColor(messageTypeColors.success)
            ]
          });
          break;
        }
        default: {
          interaction.editReply(messages.unknownError());
        }
      }
    } catch (error) {
      console.log(error, 'docSet.execute() -> DocController.setDoc()');
      interaction.editReply(messages.unknownError());
    }
  }
}