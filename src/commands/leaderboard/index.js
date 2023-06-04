const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const { messageTypeColors, responseCodes, messages, leaderboardType } = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');
const RPGController = require('../../controllers/rpg-controller');
const capitalize = require('../../utils/capitalize');

const leaderboardRankEmoji = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Prints the current Bilaim wallet leaderboard.')
    .addStringOption((option) => (
      option
        .setName('type')
        .setDescription('What leaderboard type to show. Defaults to wealth')
        .addChoices(
          { name: 'Power', value: leaderboardType.Power },
          { name: 'Wealth', value: leaderboardType.Wealth },
        )
    )),

  async execute(interaction) {
    await interaction.deferReply();
    const type = interaction.options.getString('type') || leaderboardType.Wealth;

    try {
      const { responseCode, value: wallets } = await EconomyController.getAllWallets();
      
      switch (responseCode) {
        case responseCodes.success: {
          let leaderboard;

          switch(type) {
            case leaderboardType.Wealth: {
              const sortedWealthUsers = sortWalletsByWealth(wallets, 25);

              const users = await Promise.all(
                sortedWealthUsers.map((wallet) => {
                  const [userId] = wallet;
                  return interaction.guild.members.fetch(userId);
                })
              );

              leaderboard = await buildWealthLeaderboardText(users, sortedWealthUsers);
              break;
            }
            case leaderboardType.Power: {
              const sortedCharacters = await sortCharactersByPower(Object.keys(wallets), 25);

              const users = await Promise.all(
                sortedCharacters.map((character) => {
                  const { ownerId } = character;
                  return interaction.guild.members.fetch(ownerId);
                })
              );

              leaderboard = await buildPowerLeaderboardText(users, sortedCharacters);
              break;
            }
          } 

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`${capitalize(type)} Bilaim Leaderboard`)
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

function sortWalletsByWealth(wallets, limit) {
  return Object.entries(wallets)
    .sort((
      [_, { value: valueA, bank: bankA }],
      [__, { value: valueB, bank: bankB }]
    ) => {
      return (valueB + bankB) - (valueA + bankA)
    })
    .slice(0, limit);
}

async function sortCharactersByPower(userIds, limit) {
  const characters = await Promise.all(
    userIds.map((id) => (
      RPGController.getCharacter(id)
    ))
  );
  return characters
    .sort((characterA, characterB) => {
      const { armor: armorA, weapon: weaponA } = characterA.equipmentLevels;
      const { armor: armorB, weapon: weaponB } = characterB.equipmentLevels;
      return (armorB + weaponB) - (armorA + weaponA)
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

async function buildWealthLeaderboardText(users, wallets) {
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

    leaderboardText = []; 
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const wallet = wallets[index][1];
      const walletValue = wallet.value;
      const bankValue = wallet.bank;
      const walletValueDisplay = `${walletValue}`.padEnd(userDataExtremes.walletValueLength, ' ');
      const totalBilaimCount = `${walletValue + bankValue}`.padEnd(userDataExtremes.combinedValueLength, ' ');
      const splitValuesDisplay = `(💵${walletValueDisplay} / 🏛️${bankValue}) `.padEnd(userDataExtremes.splitValueLength + 13, '-');
      const rank = index + 1;
      const rankOrdinalSuffix = getOrdinalSuffix(rank);
      const rankDisplay = `${rank}${rankOrdinalSuffix}`.padStart(4, ' ');
      const rankIndicator = leaderboardRankEmoji[index] || '⬛';
      leaderboardText.push(`󠀠󠀠${rankIndicator} ${rankDisplay}  ${totalBilaimCount} ${splitValuesDisplay} ${user.displayName}`);
    }

    leaderboardText = leaderboardText.join('\n');
  } else {
    leaderboardText = 'There is nobody to place on the leaderboard.'
  }

  return leaderboardText;
}

async function buildPowerLeaderboardText(users, characters) {
  let leaderboardText = '';

  if (users.length > 0) {
    const userDataExtremes = users.reduce((extremes, _, index) => {
      const character = characters[index];
      const { armor, weapon } = character.equipmentLevels;

      const weaponValue = `${weapon}`;
      if (weaponValue.length > extremes.weaponValueLength) {
        extremes.weaponValueLength = weaponValue.length;
      }

      const splitValue = `${armor}${weapon}`;
      if (splitValue.length > extremes.splitValueLength) {
        extremes.splitValueLength = splitValue.length;
      }

      const combinedValue = `${armor + weapon}`;
      if (combinedValue.length > extremes.combinedValueLength) {
        extremes.combinedValueLength = combinedValue.length;
      }

      return extremes;
    }, { splitValueLength: 0, combinedValueLength: 0, weaponValueLength: 0 });

    leaderboardText = []; 
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const rank = index + 1;
      const rankOrdinalSuffix = getOrdinalSuffix(rank);
      const rankDisplay = `${rank}${rankOrdinalSuffix}`.padStart(4, ' ');
      const rankIndicator = leaderboardRankEmoji[index] || '⬛';
      const character = await RPGController.getCharacter(user.id);
      const { weapon, armor } = character.equipmentLevels;
      const totalLevels = `${weapon + armor}`.padEnd(userDataExtremes.combinedValueLength, ' ');
      const weaponValueDisplay = `${weapon}`.padEnd(userDataExtremes.weaponValueLength, ' ');
      const splitValuesDisplay = `(⚔️${weaponValueDisplay} / 🛡️${armor}) `.padEnd(userDataExtremes.splitValueLength + 13, '-');
      leaderboardText.push(`󠀠󠀠${rankIndicator} ${rankDisplay}  ${totalLevels} ${splitValuesDisplay} ${user.displayName}`);
    }

    leaderboardText = leaderboardText.join('\n');
  } else {
    leaderboardText = 'There is nobody to place on the leaderboard.'
  }

  return leaderboardText;
}