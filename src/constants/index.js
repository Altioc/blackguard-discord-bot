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
  bookDoc: 'book'
};

const currentLocationType = {
  Wallet: 'value',
  Bank: 'bank'
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
    },
    jug: {
      pvp: {
        baseSuccessChance: 0.5,
        baseCounterChance: 0.3,
        baseRewardFloor: 0.1,
        baseRewardCeiling: 0.3,
        baseCounterRewardFloor: 0.1,
        baseCounterRewardCeiling: 0.3,
      },
      pve: {
        baseSuccessChance: 0.5,
        baseRewardFloor: 5,
        baseRewardCeiling: 50
      },
      cooldown: minute * 5,
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
  currentLocationType
};