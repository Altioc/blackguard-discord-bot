const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Prints the current Bilaim wallet leaderboard.'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const { responseCode, value: wallets } = await EconomyController.getAllWallets();
      
      switch (responseCode) {
        case responseCodes.success: {
          const sortedWallets = getSortedWallets(wallets);

          const users = await Promise.all(
            sortedWallets.map((wallet) => {
              const [userId] = wallet;
              return interaction.guild.members.fetch(userId);
            })
          );

          const leaderboard = buildLeaderboardText(users, sortedWallets);

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Bilaim Leaderboard')
                .setColor(messageTypeColors.success)
                .setDescription(
                  codeBlock(leaderboard)
                )
            ]
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
  },
};

function getSortedWallets(wallets) {
  return Object.entries(wallets)
    .sort((walletA, walletB) => walletB[1].value - walletA[1].value);
}

function buildLeaderboardText(users, wallets) {
  let leaderboardText = '';

  if (users.length > 0) {
    leaderboardText = users.map((user, index) => {
      const bilaimCount = wallets[index][1].value;
      const rank = index + 1;
      return `${rank < 10 ? ' ' + (index + 1) : index + 1}) ${bilaimCount} - ${user.displayName}`;
    }).join('\n');
  } else {
    leaderboardText = 'There is nobody to place on the leaderboard.'
  }

  return leaderboardText;
}