const { halfDay, hour, minute } = require('../');
const { DocName } = require('./doc-name');

const initialEconomyDoc = {
  _id: DocName.Economy,
  wallets: {},
  nextInterestPayoutDate: null,
  config: {
    currencyEmoji: ':coin:',
    bank: {
      interestRate: 0.05,
      storableValueRatio: 0.5,
      withdrawalTime: hour,
    },
    wallet: {
      initialCurrencyAmount: 100,
    },
  },
};

const initialBookDoc = {
  _id: DocName.Book,
  latestWager: null,
  config: {
    wagerTimeoutMs: halfDay,
  },
};


const initialRPGDoc = {
  _id: DocName.RPG,
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
        { recovery: 0.95, failStackModifier: 0.2, stars: 25 },
      ],
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
        baseRewardCeiling: 50,
      },
      cooldownLength: minute * 5,
    },
  },
};

const initialRolesDoc = {
  _id: DocName.Roles,
  members: {},
  config: {},
};

const initialPersistentUiDoc = {
  _id: DocName.PersistentUi,
  uiElements: {},
  config: {},
};


module.exports = {
  initialEconomyDoc,
  initialBookDoc,
  initialRPGDoc,
  initialRolesDoc,
  initialPersistentUiDoc,
};
