const { codeBlock, bold } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const {
  messageTypeColors,
  responseCodes,
  wagerEndOptions,
  messages
} = require('../../constants');
const BookController = require('../../controllers/book-controller');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('end')
      .setDescription('Ends the current wager and distributes the payments.')
      .addStringOption(option => (
        option
          .setName('outcome')
          .setDescription('The outcome of the wager.')
          .setRequired(true)
          .addChoices(
            ...Object.entries(wagerEndOptions)
              .map(([key, value]) => ({
                name: value,
                value: key
              }))
          )
      ))
  ),

  async execute(interaction) {
    const { guild, options, user } = interaction;
    const outcome = options.getString('outcome');
    const { ownerId } = BookController.latestWager;

    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator) && user.id !== ownerId) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    try {
      const { responseCode } = await BookController.endWager();
      switch (responseCode) {
        case responseCodes.success: {
          const { premise } = BookController.latestWager;
          const outcomeIsNeither = outcome === wagerEndOptions.neither;
          const message = new EmbedBuilder()
            .setTitle('End Wager')
            .setColor(messageTypeColors.success)
            .setDescription(`The ${premise} wager has ended.`)
            .addFields({ name: 'outcome:', value: `"${outcome}"` });

          if (outcomeIsNeither) {
            message.addFields({ name: 'Returning bets', value: '...' });
          } else {
            message.addFields({ name: 'Distributing payout', value: '...' });
          }

          await interaction.editReply({
            embeds: [message]
          });

          let outcomeResponse;
          if (outcomeIsNeither) {
            outcomeResponse = await BookController.rollBackBets();
          } else {
            outcomeResponse = await BookController.distributePayout(outcome);
          }

          const { responseCode: outcomeResponseCode, value: results } = outcomeResponse;

          switch (outcomeResponseCode) {
            case responseCodes.success: {
              try {
                const members = await Promise.all([
                  ...results.winners.map(result => guild.members.fetch(result.userId)),
                  ...results.losers.map(result => guild.members.fetch(result.userId))
                ]);

                const totalPlayers = [
                  ...results.winners,
                  ...results.losers
                ];

                const resultsAsFormattedString = totalPlayers.map((result, i) => {
                  return `${result.net} ${members[i].displayName}\n`;
                }).join('');

                await interaction.followUp(messages.wagerResults(`${bold('Results:')}${codeBlock('diff', resultsAsFormattedString)}`));
              } catch (error) {
                console.log(error, 'wagerEnd.execute() -> guild.members.fetch()');
                interaction.followUp(messages.unknownError());
              }

              break;
            }
            case responseCodes.rollBackBets.noParticipants: {
              await interaction.followUp(messages.wagerResults('There were no bets.'));
              break;
            }
            case responseCodes.book.distributePayout.noWinners: {
              await interaction.followUp(messages.wagerResults('There were no winners.'));
              break;
            }
            default: {
              interaction.followUp(messages.unknownError());
            }
          }

          break;
        }
        case responseCodes.book.noActiveWager: {
          await interaction.editReply(messages.noActiveWager());
          break;
        }
        default: {
          interaction.editReply(messages.unknownError());
        }
      }
    } catch (error) {
      console.log(error, 'wagerEnd.execute() -> BookController.endWager()');
      interaction.editReply(messages.unknownError());
    }
  }
}