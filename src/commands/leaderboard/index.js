const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const { messageTypeColors, responseCodes, messages } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

const leaderboardRankEmoji = ['🥇', '🥈', '🥉'];

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
          const sortedWallets = getSortedWallets(wallets, 25);

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

function getSortedWallets(wallets, limit) {
  return Object.entries(wallets)
    .sort((
      [_, { value: valueA, bank: bankA }],
      [__, { value: valueB, bank: bankB }]
    ) => {
      return (valueB + bankB) - (valueA + bankA)
    })
    .slice(0, limit);
}

function getOrdinalSuffix(num) {
  const value = `${num}`;

  if (value.endsWith('11') || value.endsWith('12') || value.endsWith('13')) {
    return 'th';
  }

  if (value.endsWith('1')) {
    return 'st';
  }

  if (value.endsWith('2')) {
    return 'nd';
  }

  if (value.endsWith('3')) {
    return 'rd';
  }

  return 'th';
}

function buildLeaderboardText(users, wallets) {
  let leaderboardText = '';

  if (users.length > 0) {
    const userDataExtremes = users.reduce((extremes, _, index) => {
      const wallet = wallets[index][1];

      const walletValue = `${wallet.value}`;
      if (walletValue.length > extremes.walletValueLength) {
        extremes.walletValueLength = walletValue.length;
      }

      const splitValue = `${wallet.value}${wallet.bank}`;
      if (splitValue.length > extremes.splitValueLength) {
        extremes.splitValueLength = splitValue.length;
      }

      const combinedValue = `${wallet.value + wallet.bank}`;
      if (combinedValue.length > extremes.combinedValueLength) {
        extremes.combinedValueLength = combinedValue.length;
      }

      return extremes;
    }, { splitValueLength: 0, combinedValueLength: 0, walletValueLength: 0 });

    leaderboardText = users.map((user, index) => {
      const wallet = wallets[index][1];
      const walletValue = wallet.value;
      const bankValue = wallet.bank;
      const walletValueDisplay = `${walletValue}`.padEnd(userDataExtremes.walletValueLength, ' ');
      const totalBilaimCount = `${walletValue + bankValue}`.padEnd(userDataExtremes.combinedValueLength, ' ');
      const splitValuesDisplay = `(${walletValueDisplay} / 🏛️${bankValue}) `.padEnd(userDataExtremes.splitValueLength + 11, '-');
      const rank = index + 1;
      const rankOrdinalSuffix = getOrdinalSuffix(rank);
      const rankDisplay = `${rank}${rankOrdinalSuffix}`.padStart(4, ' ');
      const rankIndicator = leaderboardRankEmoji[index] || '⬛';
      return `󠀠󠀠${rankIndicator} ${rankDisplay}  ${totalBilaimCount} ${splitValuesDisplay} ${user.displayName}`;
    }).join('\n');
  } else {
    leaderboardText = 'There is nobody to place on the leaderboard.'
  }

  return leaderboardText;
}