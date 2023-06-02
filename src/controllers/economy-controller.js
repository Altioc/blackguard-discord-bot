const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const {
  blackguardDbDocNames,
  initialEconomyDoc,
  responseCodes
} = require('../constants');
const Wallet = require('../models/Wallet');
const random = require('../utils/random');
const response = require('../utils/response');

class EconomyController {
  constructor() {
    this.currencyEmoji = null;
    this.walletInitialCurrencyAmount = null;
    this.pittySystemTickRate = null;
    this.pittySystemStepAmount = null;
    this.pittySystemFloor = null;
    this.pittySystemInterval = null;
    this.jugSuccessChance = null;
    this.jugCounterChance = null;
    this.jugRewardFloor = null;
    this.jugRewardCeiling = null;
    this.jugCooldownLength = null;
    this.jugCooldown = {};

    this.db = new PouchDB('BlackguardBotDb');
    this.createEconomyDocIfDoesntExist()
      .then(() => {
        return this.initConfig();
      })
      .catch((error) => {
        console.log(error, 'EconomyController.constructor()');
      });
  }

  createEconomyDocIfDoesntExist() {
    return this.db.putIfNotExists(blackguardDbDocNames.economyDoc, initialEconomyDoc)
      .catch((error) => {
        console.log(error, 'EconomyController.createEconomyDocIfDoesntExist()');
      });
  }

  resetDoc() {
    return this.db.upsert(blackguardDbDocNames.economyDoc, () => (
      initialEconomyDoc
    ));
  }

  initConfig() {
    return this.db.get(blackguardDbDocNames.economyDoc)
      .then((doc) => {
        this.currencyEmoji = doc.config.currencyEmoji;
        this.walletInitialCurrencyAmount = doc.config.wallet.initialCurrencyAmount,
        this.pittySystemTickRate = doc.config.pittySystem.tickRate;
        this.pittySystemStepAmount = doc.config.pittySystem.stepAmount;
        this.pittySystemFloor = doc.config.pittySystem.floor;
        this.jugSuccessChance = doc.config.jug.successChance;
        this.jugCounterChance = doc.config.jug.counterChance;
        this.jugRewardFloor = doc.config.jug.rewardFloor;
        this.jugRewardCeiling = doc.config.jug.rewardCeiling;
        this.jugCooldownLength = doc.config.jug.cooldown;
        this.startPittySystem();
      })
      .catch((error) => {
        console.log(error, 'EconomyController.initConfig()');
      });
  }

  startPittySystem() {
    clearInterval(this.pittySystemInterval);
    this.pittySystemInterval = setInterval(() => {
      this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
        Object.entries(doc.wallets).forEach((entry) => {
          const [userId, wallet] = entry;

          if (wallet.value < this.pittySystemFloor) {
            doc.wallets[userId].value += this.pittySystemStepAmount;
            doc.wallets[userId].value = Math.min(doc.wallets[userId].value, this.pittySystemFloor);
          }
        });

        return doc;
      })
        .catch((error) => {
          console.log(error, 'EconomyController.startPittySystem()');
        });
    }, this.pittySystemTickRate);
  }

  createWallet(userId) {
    let responseCode = responseCodes.success;

    return this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
      if (!doc.wallets[userId]) {
        doc.wallets[userId] = new Wallet(this.walletInitialCurrencyAmount);
        responseCode = responseCodes.success;
      } else {
        responseCode = responseCodes.alreadyExists;
      }
      return doc;
    })
      .then(() => {
        return response(responseCode);
      })
      .catch((error) => {
        console.log(error, 'EconomyController.createWallet()');
      });
  }

  getWallet(userId) {
    return this.db.get((blackguardDbDocNames.economyDoc))
      .then((doc) => {
        const responseCode = doc.wallets[userId] ? responseCodes.success : responseCodes.doesntExist;

        return response(responseCode, doc.wallets[userId]);
      })
      .catch((error) => {
        console.log(error, 'EconomyController.getWallet()');
      });
  }

  getAllWallets() {
    return this.db.get((blackguardDbDocNames.economyDoc))
      .then((doc) => {
        return response(responseCodes.success, doc.wallets);
      })
      .catch((error) => {
        console.log(error, 'EconomyController.getAllWallets()');
      });
  }

  deleteWallet(userId) {
    let responseCode = responseCodes.success;
    return this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
      if (doc.wallets[userId]) {
        delete doc.wallets[userId];
        responseCode = responseCodes.success;
      } else {
        responseCode = responseCodes.doesntExist;
      }

      return doc;
    })
      .then(() => {
        return response(responseCode);
      })
      .catch((error) => {
        console.log(error, 'EconomyController.deleteWallet()');
      });
  }

  transferCurrency(fromUserId, toUserId, value) {
    let responseCode = responseCodes.success;

    if (value <= 0) {
      return Promise.resolve(response(responseCodes.positiveValueNeeded));
    }

    if (fromUserId === toUserId) {
      return Promise.resolve(response(responseCodes.economy.sameUser));
    }

    return this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
      const fromUserWallet = doc.wallets[fromUserId];
      const toUserWallet = doc.wallets[toUserId];

      if (!fromUserWallet) {
        responseCode = responseCodes.economy.noFromUser;
      } else if (!toUserWallet) {
        responseCode = responseCodes.economy.noToUser;
      } else if (fromUserWallet.value - value < 0) {
        responseCode = responseCodes.economy.insufficientFunds;
      } else {
        fromUserWallet.value -= +value;
        toUserWallet.value += +value;
      }

      return doc;
    })
      .then(() => {
        return response(responseCode);
      })
      .catch((error) => {
        console.log(error, 'EconomyController.transferCurrency()');
      });
  }

  modifyCurrency(targetUserId, amount) {
    let newValue;

    return this.db.get(blackguardDbDocNames.economyDoc)
      .then((doc) => {
        if (!doc.wallets[targetUserId]) {
          return Promise.resolve(response(responseCodes.userDoesNotExist))
        }

        return this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
          doc.wallets[targetUserId].value += amount;

          if (doc.wallets[targetUserId].value < 0) {
            doc.wallets[targetUserId].value = 0;
          }

          newValue = doc.wallets[targetUserId].value;
          return doc;
        })
          .then(() => {
            return response(
              responseCodes.success,
              newValue
            );
          })
          .catch((error) => {
            console.log(error, 'EconomyController.modifyCurrency() -> db.upsert');
          });

      })
      .catch((error) => {
        console.log(error, 'EconomyController.modifyCurrency() -> db.get');
      });

  }

  bulkModifyCurrency(modifications) {
    return this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
      modifications.forEach((modification) => {
        const { userId, value } = modification;
        doc.wallets[userId].value += +value;

        if (doc.wallets[userId].value < 0) {
          doc.wallets[userId].value = 0;
        }
      });

      return doc;
    })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch((error) => {
        console.log(error, 'EconomyController.bulkModifyCurrency()');
      });
  }

  clearJugCooldown(juggerId) {
    if (!juggerId) {
      Object.values(this.jugCooldown).forEach(({ timer }) => {
        clearTimeout(timer);
      });
      this.jugCooldown = {};
    } else if (this.jugCooldown[juggerId]) {
      this.jugCooldown[juggerId].isActive = false;
      clearTimeout(this.jugCooldown[juggerId].timer);
    } else {
      return response(responseCodes.userDoesNotExist);
    }

    return response(responseCodes.success);
  }

  startJugCooldown(juggerId) {
    this.jugCooldown[juggerId] = {};
    this.jugCooldown[juggerId].isActive = true;
    this.jugCooldown[juggerId].endTime = Date.now() + this.jugCooldownLength;
    clearTimeout(this.jugCooldown[juggerId].timer);
    this.jugCooldown[juggerId].timer = setTimeout(() => {
      this.jugCooldown[juggerId].isActive = false;
    }, this.jugCooldownLength);
  }

  jug(juggerId, juggedId, jugBetValue) {
    if (this.jugCooldown[juggerId]?.isActive) {
      return response(responseCodes.onCooldown, this.jugCooldown[juggerId].endTime);
    }

    let result = {};
    return this.db.get(blackguardDbDocNames.economyDoc)
      .then((doc) => {
        const juggersWallet = doc.wallets[juggerId];
        const juggedsWallet = doc.wallets[juggedId];

        if (!juggersWallet) {
          result = response(responseCodes.economy.noFromUser);
          return;
        }

        if (!juggedsWallet) {
          result = response(responseCodes.economy.noToUser);
          return;
        }

        if (juggerId === juggedId) {
          result = response(responseCodes.economy.sameUser);
          return;
        }

        if (juggersWallet.value < +jugBetValue) {
          result = response(responseCodes.economy.insufficientFunds);
          return;
        }

        const juggingRoll = Math.random();

        this.startJugCooldown(juggerId);
        if (juggingRoll <= this.jugSuccessChance) {
          const jugMultiplier = random(this.jugRewardFloor, this.jugRewardCeiling);
          const idealJugValue = Math.floor(jugBetValue * jugMultiplier);
          const finalJugValue = juggedsWallet.value < idealJugValue ? juggedsWallet.value : idealJugValue;

          result = response(
            responseCodes.success,
            Math.max(finalJugValue, 1)
          );

          return this.transferCurrency(juggedId, juggerId, result.value)
            .catch((error) => {
              console.log(error, 'EconomyController.jug() -> success transferCurrency');
            });
        } else {
          const counterRoll = Math.random();

          if (counterRoll <= this.jugCounterChance) {
            const counterValue = random(this.jugRewardFloor, this.jugRewardCeiling);

            result = response(
              responseCodes.economy.jug.counterSuccess,
              Math.max(Math.floor(jugBetValue * counterValue), 1)
            );

            return this.transferCurrency(juggerId, juggedId, result.value)
              .then(() => {
                return this.modifyCurrency(juggerId, -jugBetValue);
              })
              .catch((error) => {
                console.log(error, 'EconomyController.jug() -> countered transferCurrency');
              });
          } else {
            result = response(responseCodes.failure);

            return this.modifyCurrency(juggerId, -jugBetValue)
              .catch((error) => {
                console.log(error, 'EconomyController.jug() -> failure transferCurrency');
              });
          }
        }

      })
      .then(() => {
        return result;
      })
      .catch((error) => {
        console.log(error, 'EconomyController.jug() -> db.get');
      });

  }
}

module.exports = new EconomyController();
