const { EmbedBuilder } = require('discord.js')
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const BookController = require('../../controllers/book-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('start')
      .setDescription('Starts a new wager with the given premise.')
      .addStringOption(option => (
        option
          .setName('premise')
          .setDescription('The premise of the wager.')
          .setRequired(true)
      ))
  ),

  async execute(interaction) {
    const { user, options } = interaction;
    const premise = options.getString('premise');

    try {
      const { responseCode } = await BookController.startWager(user.id, premise);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('New Wager')
                .setColor(messageTypeColors.success)
                .setDescription('A new wager has been created')
                .addFields({ name: 'Premise:', value: `"${premise}".` })
            ]
          });
          break;
        }
        case responseCodes.book.activeWagerAlreadyExists: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Already Exists')
                .setColor(messageTypeColors.failure)
                .setDescription('There is already an active wager running. Please end that one before starting a new one.')
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
      console.log(error, 'wagerStart.execute() -> BookController.startWager()');
      interaction.editReply(messages.unknownError());
    }
  }
}