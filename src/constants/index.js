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
  unknown: 0xFF00D9
};

const blackguardDbDocNames = {
  economyDoc: 'economy',
  bookDoc: 'book',
  rpgDoc: 'rpg'
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

const initialRPGDoc = {
  _id: blackguardDbDocNames.rpgDoc,
  characters: {},
  config: {
    equipmentStats: {
      upgrades: [
        { cost: 20, chance: 1, star: 1 },
        { cost: 80, chance: 0.95, star: 2 },
        { cost: 180, chance: 0.9, star: 3 },
        { cost: 320, chance: 0.85, star: 4 },
        { cost: 500, chance: 0.8, star: 5 },
        { cost: 540, chance: 0.75, star: 6 },
        { cost: 660, chance: 0.7, star: 7 },
        { cost: 860, chance: 0.65, star: 8 },
        { cost: 1140, chance: 0.6, star: 9 },
        { cost: 1500, chance: 0.6, star: 10 },
        { cost: 1580, chance: 0.6, star: 11 },
        { cost: 1820, chance: 0.55, star: 12 },
        { cost: 2220, chance: 0.55, star: 13 },
        { cost: 2780, chance: 0.55, star: 14 },
        { cost: 3500, chance: 0.5, star: 15 },
        { cost: 3660, chance: 0.5, star: 16 },
        { cost: 4140, chance: 0.5, star: 17 },
        { cost: 4940, chance: 0.45, star: 18 },
        { cost: 6060, chance: 0.45, star: 19 },
        { cost: 7500, chance: 0.4, star: 20 },
        { cost: 9977, chance: 0.4, star: 21 },
        { cost: 17407, chance: 0.4, star: 22 },
        { cost: 29791, chance: 0.3, star: 23 },
        { cost: 47129, chance: 0.3, star: 24 },
        { cost: 69420, chance: 0.25, star: 25 },
      ],
      weapon: [
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0, stars: 0 }, // x/5 * 0.5
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.1, stars: 1 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.2, stars: 2 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.3, stars: 3 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.4, stars: 4 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.5, stars: 5 }, // 0.5 + x**2 / 5**2 * 0.5
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.52, stars: 6 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.58, stars: 7 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.68, stars: 8 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 0.82, stars: 9 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1, stars: 10 }, // 1 + x**2 / 10**2
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.01, stars: 11 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.04, stars: 12 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.09, stars: 13 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.16, stars: 14 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.25, stars: 15 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.36, stars: 16 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.49, stars: 17 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.64, stars: 18 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 1.81, stars: 19 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 2, stars: 20 }, // 2 + x**2 / 5**2 * 1.3
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 2.05, stars: 21 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 2.21, stars: 22 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 2.47, stars: 23 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 2.83, stars: 24 },
        { rewardFloor: 0.1, rewardCeiling: 0.3, rewardModifier: 3.3, stars: 25 },
      ],
      armor: [
        { recovery: 0, failStackModifier: 0, stars: 0 }, // x**2 / 10**2 * 0.4
        { recovery: 0.01, failStackModifier: 0, stars: 1 },
        { recovery: 0.02, failStackModifier: 0, stars: 2 },
        { recovery: 0.04, failStackModifier: 0, stars: 3 },
        { recovery: 0.06, failStackModifier: 0, stars: 4 },
        { recovery: 0.1, failStackModifier: 0, stars: 5 },
        { recovery: 0.14, failStackModifier: 0, stars: 6 },
        { recovery: 0.2, failStackModifier: 0, stars: 7 },
        { recovery: 0.26, failStackModifier: 0, stars: 8 },
        { recovery: 0.32, failStackModifier: 0, stars: 9 },
        { recovery: 0.4, failStackModifier: 0.05, stars: 10 }, // 0.4 + x**2 / 10**2 * 0.3
        { recovery: 0.41, failStackModifier: 0.05, stars: 11 },
        { recovery: 0.42, failStackModifier: 0.05, stars: 12 },
        { recovery: 0.43, failStackModifier: 0.05, stars: 13 },
        { recovery: 0.45, failStackModifier: 0.05, stars: 14 },
        { recovery: 0.48, failStackModifier: 0.1, stars: 15 },
        { recovery: 0.51, failStackModifier: 0.1, stars: 16 },
        { recovery: 0.55, failStackModifier: 0.1, stars: 17 },
        { recovery: 0.59, failStackModifier: 0.1, stars: 18 },
        { recovery: 0.64, failStackModifier: 0.1, stars: 19 },
        { recovery: 0.7, failStackModifier: 0.2, stars: 20 }, // 0.7 + x**2 / 5**2 * 0.2
        { recovery: 0.71, failStackModifier: 0.2, stars: 21 },
        { recovery: 0.73, failStackModifier: 0.2, stars: 22 },
        { recovery: 0.77, failStackModifier: 0.2, stars: 23 },
        { recovery: 0.83, failStackModifier: 0.2, stars: 24 },
        { recovery: 0.9, failStackModifier: 0.25, stars: 25 }
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
        baseRewardFloor: 5,
        baseRewardCeiling: 50
      },
      cooldown: minute * 5,
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
  roleSelectMenu: 'roleSelectMenu'
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
  leaderboardType
};