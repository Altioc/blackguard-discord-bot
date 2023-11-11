const { EmbedBuilder } = require('discord.js');

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const halfDay = hour * 12;
const fullDay = hour * 24;

const baseCommandCooldown = second;

const commandIds = {
  wallet: 'wallet',
  walletRead: 'walletRead',
  walletPay: 'walletPay',
  walletCreate: 'walletCreate',
  walletDelete: 'walletDelete',
  walletAdd: 'walletAdd',
  walletRemove: 'walletRemove',
  wager: 'wager',
  wagerBet: 'wagerBet',
  wagerRead: 'wagerRead',
  wagerClose: 'wagerClose',
  wagerOpen: 'wagerOpen',
  wagerStart: 'wagerStart',
  wagerEnd: 'wagerEnd',
  wagerReactivate: 'wagerReactivate',
  doc: 'doc',
  docGet: 'docGet',
  docSet: 'docSet',
  jug: 'jug',
  leaderboard: 'leaderboard'
};

const rootCommandIds = {
  wallet: commandIds.wallet,
  wager: commandIds.wager,
  doc: commandIds.doc,
  jug: commandIds.jug,
  leaderboard: commandIds.leaderboard
};

const messageTypeColors = {
  success: 0x279C54,
  warning: 0xFFE030,
  failure: 0xCC2f4E,
  unknown: 0xFF00D9,
};

const blackguardDbDocNames = {
  economyDoc: 'economy',
  bookDoc: 'book',
  rpgDoc: 'rpg',
  guildDoc: 'guild'
};

const currentLocationType = {
  Wallet: 'value',
  Bank: 'bank'
};

const equipmentType = {
  Armor: 'armor',
  Weapon: 'weapon'
};

const leaderboardType = {
  Power: 'power',
  Wealth: 'wealth'
};

const initialGuildDoc = {
  _id: blackguardDbDocNames.guildDoc,
  introductionAutomator: {
    channelId: null
  }
};

const initialRPGDoc = {
  _id: blackguardDbDocNames.rpgDoc,
  characters: {},
  config: {
    equipmentStats: {
      upgrades: [
        { cost: 7, chance: 1, star: 1 },
        { cost: 27, chance: 0.95, star: 2 },
        { cost: 60, chance: 0.9, star: 3 },
        { cost: 107, chance: 0.85, star: 4 },
        { cost: 177, chance: 0.8, star: 5 },
        { cost: 180, chance: 0.75, star: 6 },
        { cost: 220, chance: 0.7, star: 7 },
        { cost: 287, chance: 0.65, star: 8 },
        { cost: 380, chance: 0.6, star: 9 },
        { cost: 500, chance: 0.6, star: 10 },
        { cost: 527, chance: 0.6, star: 11 },
        { cost: 607, chance: 0.55, star: 12 },
        { cost: 740, chance: 0.55, star: 13 },
        { cost: 927, chance: 0.55, star: 14 },
        { cost: 1167, chance: 0.5, star: 15 },
        { cost: 1220, chance: 0.5, star: 16 },
        { cost: 1380, chance: 0.5, star: 17 },
        { cost: 1593, chance: 0.45, star: 18 },
        { cost: 1806, chance: 0.45, star: 19 },
        { cost: 2020, chance: 0.4, star: 20 },
        { cost: 3326, chance: 0.4, star: 21 },
        { cost: 5802, chance: 0.4, star: 22 },
        { cost: 9930, chance: 0.3, star: 23 },
        { cost: 15709, chance: 0.3, star: 24 },
        { cost: 23140, chance: 0.25, star: 25 },
      ],
      weapon: [
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0, stars: 0 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.1, stars: 1 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.2, stars: 2 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.3, stars: 3 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.4, stars: 4 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.5, stars: 5 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.6, stars: 6 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.7, stars: 7 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.8, stars: 8 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.9, stars: 9 },
        { rewardFloor: 0.15, rewardCeiling: 0.3, rewardModifier: 1, stars: 10 },
        { rewardFloor: 0.15, rewardCeiling: 0.3, rewardModifier: 1.2, stars: 11 },
        { rewardFloor: 0.15, rewardCeiling: 0.3, rewardModifier: 1.4, stars: 12 },
        { rewardFloor: 0.15, rewardCeiling: 0.3, rewardModifier: 1.6, stars: 13 },
        { rewardFloor: 0.15, rewardCeiling: 0.3, rewardModifier: 1.8, stars: 14 },
        { rewardFloor: 0.2, rewardCeiling: 0.3, rewardModifier: 2, stars: 15 },
        { rewardFloor: 0.2, rewardCeiling: 0.3, rewardModifier: 2.4, stars: 16 },
        { rewardFloor: 0.2, rewardCeiling: 0.3, rewardModifier: 2.8, stars: 17 },
        { rewardFloor: 0.2, rewardCeiling: 0.3, rewardModifier: 3.2, stars: 18 },
        { rewardFloor: 0.2, rewardCeiling: 0.3, rewardModifier: 3.6, stars: 19 },
        { rewardFloor: 0.25, rewardCeiling: 0.3, rewardModifier: 4, stars: 20 },
        { rewardFloor: 0.25, rewardCeiling: 0.3, rewardModifier: 4.5, stars: 21 },
        { rewardFloor: 0.25, rewardCeiling: 0.3, rewardModifier: 5, stars: 22 },
        { rewardFloor: 0.25, rewardCeiling: 0.3, rewardModifier: 5.5, stars: 23 },
        { rewardFloor: 0.25, rewardCeiling: 0.3, rewardModifier: 6, stars: 24 },
        { rewardFloor: 0.25, rewardCeiling: 0.3, rewardModifier: 7, stars: 25 },
      ],
      armor: [
        { recovery: 0, failStackModifier: 0, stars: 0 },
        { recovery: 0.04, failStackModifier: 0, stars: 1 },
        { recovery: 0.08, failStackModifier: 0, stars: 2 },
        { recovery: 0.11, failStackModifier: 0, stars: 3 },
        { recovery: 0.15, failStackModifier: 0, stars: 4 },
        { recovery: 0.19, failStackModifier: 0, stars: 5 },
        { recovery: 0.23, failStackModifier: 0, stars: 6 },
        { recovery: 0.26, failStackModifier: 0, stars: 7 },
        { recovery: 0.3, failStackModifier: 0, stars: 8 },
        { recovery: 0.34, failStackModifier: 0, stars: 9 },
        { recovery: 0.38, failStackModifier: 0.03, stars: 10 },
        { recovery: 0.41, failStackModifier: 0.03, stars: 11 },
        { recovery: 0.45, failStackModifier: 0.03, stars: 12 },
        { recovery: 0.49, failStackModifier: 0.03, stars: 13 },
        { recovery: 0.53, failStackModifier: 0.03, stars: 14 },
        { recovery: 0.56, failStackModifier: 0.06, stars: 15 },
        { recovery: 0.6, failStackModifier: 0.06, stars: 16 },
        { recovery: 0.64, failStackModifier: 0.06, stars: 17 },
        { recovery: 0.68, failStackModifier: 0.06, stars: 18 },
        { recovery: 0.71, failStackModifier: 0.06, stars: 19 },
        { recovery: 0.75, failStackModifier: 0.1, stars: 20 },
        { recovery: 0.79, failStackModifier: 0.1, stars: 21 },
        { recovery: 0.83, failStackModifier: 0.1, stars: 22 },
        { recovery: 0.86, failStackModifier: 0.2, stars: 23 },
        { recovery: 0.9, failStackModifier: 0.2, stars: 24 },
        { recovery: 0.95, failStackModifier: 0.2, stars: 25 }
      ]
    },
    jug: {
      pvp: {
        successChance: 0.5,
        counterChance: 0.3,
        counterRewardFloor: 0.1,
        counterRewardCeiling: 0.3,
      },
      pve: {
        successChance: 0.7,
        baseRewardFloor: 20,
        baseRewardCeiling: 50
      },
      cooldownLength: minute * 5,
    }
  }
};

const initialEconomyDoc = {
  _id: blackguardDbDocNames.economyDoc,
  wallets: {},
  config: {
    currencyEmoji: ':coin:',
    bank: {
      interestRate: 0.05,
      storableValueRatio: 0.5,
      interestTickRate: fullDay,
      withdrawalTime: hour
    },
    wallet: {
      initialCurrencyAmount: 100
    }
  }
};

const responseCodes = {
  success: 'success',
  failure: 'failure',
  updated: 'updated',
  invalidInput: 'invalidInput',
  alreadyExists: 'alreadyExists',
  doesntExist: 'doesntExist',
  userDoesNotExist: 'userDoesNotExist',
  positiveValueNeeded: 'positiveValueNeeded',
  onCooldown: 'onCooldown',
  valueTooHigh: 'valueTooHigh',
  economy: {
    insufficientFunds: 'insufficientFunds',
    noFromUser: 'noFromUser',
    noToUser: 'noToUser',
    sameUser: 'sameUser',
    jug: {
      counterSuccess: 'counterSuccess'
    },
    bank: {
      storingTooMuchValue: 'storingTooMuchValue',
      withdrawalAmountUpdated: 'withdrawalAmountUpdated',
      noExistingWithdrawal: 'noExistingWithdrawal',
      existingWithdrawal: 'existingWithdrawal'
    }
  },
  book: {
    noActiveWager: 'noActiveWager',
    noOpenWager: 'noOpenWager',
    ownWager: 'ownWager',
    activeWagerAlreadyExists: 'activeWagerAlreadyExists',
    distributePayout: {
      noWinners: 'noWinners'
    },
    rollback: {
      noParticipants: 'noParticipants'
    },
    setWagerOpenState: {
      wrongState: 'wrongState'
    }
  },
  config: {
    setConfig: {
      invalidJSON: 'invalidJSON'
    }
  }
};

const betOptions = { 
  yes: 'yes',
  no: 'no'
};

const initialBookDoc = {
  _id: blackguardDbDocNames.bookDoc,
  latestWager: null,
  config: {
    wagerTimeoutMs: halfDay
  }
};

const wagerEndOptions = { 
  ...betOptions,
  neither: 'neither'
};

const messages = {
  unknownError: () => ({
    content: 'An unknown error has occurred.',
    ephemeral: true
  }),
  authorNoWallet: () => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('No Wallet')
        .setColor(messageTypeColors.failure)
        .setDescription('You do not have a Bilaim wallet.')
    ],
    ephemeral: true
  }),
  targetNoWallet: (targetDisplayName) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('No Wallet')
        .setColor(messageTypeColors.failure)
        .setDescription(`${targetDisplayName} does not have a Bilaim wallet.`)
    ],
    ephemeral: true
  }),
  invalidTarget: (description) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('Invalid Target')
        .setColor(messageTypeColors.failure)
        .setDescription(description)
    ],
    ephemeral: true
  }),
  insufficientFunds: () => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('Insufficient Funds')
        .setColor(messageTypeColors.failure)
        .setDescription('You do not have enough Bilaims to make this transaction.')
    ],
    ephemeral: true
  }),
  noActiveWager: () => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('No Active Wager')
        .setColor(messageTypeColors.failure)
        .setDescription('There are no active wagers.')
    ],
    ephemeral: true
  }),
  wagerClosed: (description) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('Wager is Closed')
        .setColor(messageTypeColors.failure)
        .setDescription(description)
    ],
    ephemeral: true
  }),
  wagerResults: (description) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('Wager Results')
        .setColor(messageTypeColors.success)
        .setDescription(description)
    ]
  }),
  incorrectPermissions: () => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('Incorrect Permissions')
        .setColor(messageTypeColors.failure)
        .setDescription('You do not have permission to run this command.')
    ],
    ephemeral: true
  }),
  onCooldown: (timeStamp) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('On Cooldown')
        .setColor(messageTypeColors.failure)
        .setDescription(`You will be off cooldown ${timeStamp}.`)
    ],
    ephemeral: true
  })
};

const interactionTypes = {
  command: 'command',
  roleSelectMenu: 'roleSelectMenu',
  button: 'button',
  modal: 'modal'
};

module.exports = {
  baseCommandCooldown,
  messageTypeColors,
  blackguardDbDocNames,
  initialEconomyDoc,
  responseCodes,
  initialBookDoc,
  betOptions,
  wagerEndOptions,
  commandIds,
  rootCommandIds,
  messages,
  interactionTypes,
  minute,
  second,
  currentLocationType,
  initialRPGDoc,
  equipmentType,
  leaderboardType,
  initialGuildDoc
};