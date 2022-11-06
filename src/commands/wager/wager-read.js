const { EmbedBuilder } = require('discord.js')
const { messageTypeColors, messages } = require('../../constants');
const BookController = require('../../controllers/book-controller');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('read')
      .setDescription('Prints out the currently active wager.')
  ),

  async execute(interaction) {
    const { user, guild } = interaction;
    const { latestWager } = BookController;

    if (!latestWager.isActive) {
      await interaction.editReply(messages.noActiveWager());
      return;
    }

    try {
      const ownerUser = await guild.members.fetch(latestWager.ownerId);
      const authorsBet = latestWager.bets.find(bet => bet.ownerId === user.id);

      const message = new EmbedBuilder()
        .setTitle('Current Wager')
        .setColor(messageTypeColors.success)
        .setDescription(`The active wager is: "${latestWager.premise}"`)
        .addFields({ name: 'Owned by:', value: `"${ownerUser.displayName}"` });

      if (authorsBet) {
        message.addFields({ 
          name: 'You have bet:', 
          value: `${EconomyController.currencyEmoji} ${authorsBet.value} on "${authorsBet.option}".`
        });
      }

      message.addFields({ name: 'Status:', value: ['Closed', 'Open'][+latestWager.isOpen] });

      await interaction.editReply({
        embeds: [message]
      });
    } catch (error) {
      console.log(error, 'wagerRead.execute() -> guild.members.fetch()');
      interaction.editReply(messages.unknownError());
    }
  }
}