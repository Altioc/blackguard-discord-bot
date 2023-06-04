const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const {
  blackguardDbDocNames,
  responseCodes,
  initialRPGDoc,
  currentLocationType
} = require('../constants');
const random = require('../utils/random');
const response = require('../utils/response');
const EconomyController = require('./economy-controller');
const Character = require('../models/Character');

class RPGController {
  constructor() {
    this.jugging = {
      pvp: {
        successChance: null,
        counterChance: null,
        counterRewardFloor: null,
        counterRewardCeiling: null
      },
      pve: {
        successChance: null,
        baseRewardFloor: null,
        baseRewardCeiling: null
      },
      cooldownLength: null,
      playerCooldowns: {}
    }
    this.equipmentStats = {
      upgrades: [],
      weapon: [],
      armor: []
    };
    this.characters = {};
    this.db = new PouchDB('BlackguardBotDb');
    this.createRPGDocIfDoesntExist()
      .then(() => {
        return this.initConfig();
      })
      .catch((error) => {
        console.log(error, 'RPGController.constructor()');
      });
  }

  createRPGDocIfDoesntExist() {
    return this.db.putIfNotExists(blackguardDbDocNames.rpgDoc, initialRPGDoc)
      .catch((error) => {
        console.log(error, 'RPGController.createRPGDocIfDoesntExist()');
      });
  }

  resetDoc() {
    return this.db.upsert(blackguardDbDocNames.rpgDoc, () => (
      initialRPGDoc
    ));
  }

  initConfig() {
    return this.db.get(blackguardDbDocNames.rpgDoc)
      .then((doc) => {
        this.jugging.pvp = {
          ...doc.config.jug.pvp
        };
        
        this.jugging.pve = {
          ...doc.config.jug.pve
        };

        this.equipmentStats = {
          ...doc.config.equipmentStats
        };

        Object.values(doc.characters).forEach((character) => {
          this.characters[character.ownerId] = new Character(character);
        });
        
        this.jugging.cooldownLength = doc.config.jug.cooldown;
      })
      .catch((error) => {
        console.log(error, 'RPGController.initConfig()');
      });
  }

  async saveCharacter(characterId) {
    const character = this.characters[characterId];

    return this.db.upsert(blackguardDbDocNames.rpgDoc, (doc) => {
      doc.characters[characterId] = character.toJsonCompatibleObject();
      return doc;
    });
  }

  async getCharacter(characterId) {
    if (!this.characters[characterId]) {
      this.characters[characterId] = new Character({ ownerId: characterId });
      await this.saveCharacter(characterId);
    }

    return this.characters[characterId];
  }

  async resetFailStacks(characterId) {
    const character = this.characters[characterId];
    character.failStacks = 0;

    return this.saveCharacter(characterId);
  }

  async increaseFailStacks(characterId) {
    const character = this.characters[characterId];
    character.failStacks += 1;

    return this.saveCharacter(characterId);
  }

  enhanceEquipment(ownerId, equipmentType) {
    return EconomyController.getWallet(ownerId)
      .then(async ({ value: wallet }) => {
        if (!wallet) {
          return response(responseCodes.doesntExist);
        }

        const character = await this.getCharacter(ownerId);
        const itemLevel = character.equipmentLevels[equipmentType];
        const { cost, chance } = this.equipmentStats.upgrades[itemLevel];

        if (wallet.bank < cost) {
          return response(responseCodes.economy.insufficientFunds);
        }

        return EconomyController.modifyCurrency(ownerId, -cost, currentLocationType.Bank)
          .then(async ({ responseCode }) => {
            if (responseCode !== responseCodes.success) {
              return;
            }

            const enhanceRoll = Math.random();

            if (enhanceRoll <= chance) {
              character.equipmentLevels[equipmentType] += 1;
              return this.saveCharacter(ownerId)
                .then(() => {
                  return response(responseCodes.success);
                });
            } else {
              return response(responseCodes.failure);
            }
          })
      })
  }

  clearJugCooldown(juggerId) {
    if (!juggerId) {
      Object.values(this.jugging.playerCooldowns).forEach(({ timer }) => {
        clearTimeout(timer);
      });
      this.jugging.playerCooldowns = {};
    } else if (this.jugging.playerCooldowns[juggerId]) {
      this.jugging.playerCooldowns[juggerId].isActive = false;
      clearTimeout(this.jugging.playerCooldowns[juggerId].timer);
    } else {
      return response(responseCodes.userDoesNotExist);
    }

    return response(responseCodes.success);
  }

  startJugCooldown(juggerId) {
    this.jugging.playerCooldowns[juggerId] = {};
    this.jugging.playerCooldowns[juggerId].isActive = true;
    this.jugging.playerCooldowns[juggerId].endTime = Date.now() + this.jugging.cooldownLength;
    clearTimeout(this.jugging.playerCooldowns[juggerId].timer);
    this.jugging.playerCooldowns[juggerId].timer = setTimeout(() => {
      this.jugging.playerCooldowns[juggerId].isActive = false;
    }, this.jugging.cooldownLength);
  }

  npcJug(juggerId) {
    return EconomyController.getAllWallets()
      .then(async ({ value: wallets }) => {
        const juggersWallet = wallets[juggerId];

        if (!juggersWallet) {
          return response(responseCodes.economy.noFromUser);
        }

        const character = await this.getCharacter(juggerId);
        const juggingRoll = Math.random();

        this.startJugCooldown(juggerId);
        const weapon = this.equipmentStats.weapon[character.equipmentLevels.weapon];
        const { successChance, baseRewardCeiling, baseRewardFloor } = this.jugging.pve;
        if (juggingRoll <= successChance) {
          const jugAmount = Math.round(random(
            Character.getModifiedRewardValue(baseRewardFloor, weapon.rewardModifier), 
            character.getModifiedRewardValue(baseRewardCeiling, weapon.rewardModifier)
          ));

          return EconomyController.modifyCurrency(juggerId, jugAmount)
            .then(() => {
              return response(responseCodes.success, {
                finalJugAmount: jugAmount,
                cooldownEndTime: this.jugging.playerCooldowns[juggerId].endTime
              });
            })
            .catch((error) => {
              console.log(error, 'RPGController.npcJug() -> success modifyCurrency');
            });
        } else {
          await this.increaseFailStacks(juggerId);
          return response(responseCodes.failure, this.jugging.playerCooldowns[juggerId].endTime);
        }
      });
  }

  jug(juggerId, victimId, initialJugAmount) {
    if (this.jugging.playerCooldowns[juggerId]?.isActive) {
      return response(responseCodes.onCooldown, this.jugging.playerCooldowns[juggerId].endTime);
    }

    if (victimId === null) {
      return this.npcJug(juggerId);
    }

    if (`${initialJugAmount}`.toLowerCase() !== 'all' && (isNaN(+initialJugAmount) || +initialJugAmount <= 0)) {
      return response(responseCodes.invalidInput);
    }

    let result = {};
    return EconomyController.getAllWallets()
      .then(async ({ value: wallets }) => {
        const juggersWallet = wallets[juggerId];
        const victimWallet = wallets[victimId];

        if (!juggersWallet) {
          result = response(responseCodes.economy.noFromUser);
          return;
        }

        if (!victimWallet) {
          result = response(responseCodes.economy.noToUser);
          return;
        }

        if (juggerId === victimId) {
          result = response(responseCodes.economy.sameUser);
          return;
        }

        const jugAmount = initialJugAmount.toLowerCase() === 'all' ? juggersWallet.value : +initialJugAmount;
        if (juggersWallet.value < jugAmount) {
          result = response(responseCodes.economy.insufficientFunds);
          return;
        }

        const juggingRoll = Math.random();

        this.startJugCooldown(juggerId);
        const { successChance, counterChance, counterRewardCeiling, counterRewardFloor } = this.jugging.pvp;
        const character = await this.getCharacter(juggerId);
        const { failStacks, equipmentLevels } = character;
        const { armor: armorLevel, weapon: weaponLevel } = equipmentLevels;
        const { recovery, failStackModifier } = this.equipmentStats.armor[armorLevel];
        const { rewardFloor, rewardCeiling, rewardModifier } = this.equipmentStats.weapon[weaponLevel];
        const realSuccessChance = successChance + ((failStackModifier + 0.01) * failStacks) ;

        if (juggingRoll <= realSuccessChance) {
          await this.resetFailStacks(juggerId);          
          const jugMultiplier = random(
            Character.getModifiedRewardValue(rewardFloor, rewardModifier), 
            Character.getModifiedRewardValue(rewardCeiling, rewardModifier)
          );
          const idealJugAmount = Math.round(jugAmount * jugMultiplier);
          const finalJugAmount = Math.max(victimWallet.value < idealJugAmount ? victimWallet.value : idealJugAmount, 1);

          result = response(
            responseCodes.success, {
            finalJugAmount,
            cooldownEndTime: this.jugging.playerCooldowns[juggerId].endTime
          });

          return EconomyController.transferCurrency(victimId, juggerId, finalJugAmount)
            .catch((error) => {
              console.log(error, 'RPGController.jug() -> success transferCurrency');
            });
        } else {
          await this.increaseFailStacks(juggerId);
          const counterRoll = Math.random();

          if (counterRoll <= counterChance) {
            const counterAmount = random(counterRewardCeiling, counterRewardFloor);
            const finalCounterAmount = Math.max(Math.round(jugAmount * counterAmount), 1);

            result = response(
              responseCodes.economy.jug.counterSuccess, {
              finalJugAmount: finalCounterAmount,
              cooldownEndTime: this.jugging.playerCooldowns[juggerId].endTime
            });

            return EconomyController.transferCurrency(juggerId, victimId, finalCounterAmount)
              .then(() => {
                return EconomyController.modifyCurrency(juggerId, -(jugAmount * (1 - recovery)));
              })
              .catch((error) => {
                console.log(error, 'RPGController.jug() -> countered transferCurrency');
              });
          } else {
            result = response(responseCodes.failure, this.jugging.playerCooldowns[juggerId].endTime);

            return EconomyController.modifyCurrency(juggerId, -(jugAmount * (1 - recovery)))
              .catch((error) => {
                console.log(error, 'RPGController.jug() -> failure transferCurrency');
              });
          }
        }
      })
      .then(() => {
        return result;
      })
      .catch((error) => {
        console.log(error, 'RPGController.jug() -> db.get');
      });

  }
}

module.exports = new RPGController();
