const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const {
  blackguardDbDocNames,
  initialEconomyDoc,
  responseCodes,
  currentLocationType
} = require('../constants');
const Wallet = require('../models/Wallet');
const random = require('../utils/random');
const response = require('../utils/response');

class EconomyController {
  constructor() {
    this.jugging = {
      pvp: {
        baseSuccessChance: null,
        baseCounterChance: null,
        baseRewardFloor: null,
        baseRewardCeiling: null,
        baseCounterRewardFloor: null,
        baseCounterRewardCeiling: null
      },
      pve: {
        baseSuccessChance: null,
        baseRewardFloor: null,
        baseRewardCeiling: null
      },
      cooldownLength: null,
      playerCooldowns: {}
    }
    this.bank = {
      interestRate: null,
      storableValueRatio: null,
      interestTickRate: null,
      withdrawalTime: null,
      activeWithdrawals: {}
    };
    this.currencyEmoji = null;
    this.walletInitialCurrencyAmount = null;
    this.bankInterestInterval = null;
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
        this.jugging.pvp = {
          ...doc.config.jug.pvp
        };
        this.jugging.pve = {
          ...doc.config.jug.pve
        };
        this.bank = {
          ...this.bank,
          ...doc.config.bank
        }
        this.jugging.cooldownLength = doc.config.jug.cooldown;
        this.currencyEmoji = doc.config.currencyEmoji;
        this.walletInitialCurrencyAmount = doc.config.wallet.initialCurrencyAmount,
       
        this.startInterestSystem();
      })
      .catch((error) => {
        console.log(error, 'EconomyController.initConfig()');
      });
  }

  startInterestSystem() {
    clearInterval(this.bankInterestInterval);
    this.bankInterestInterval = setInterval(() => {
      this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
        Object.entries(doc.wallets).forEach(([ userId ]) => {
          doc.wallets[userId].bank = Math.floor(doc.wallets[userId].bank * (1 + this.bank.interestRate));
        });

        return doc;
      })
        .catch((error) => {
          console.log(error, 'EconomyController.startInterestSystem()');
        });
    }, this.bank.interestTickRate);
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
      .then(() =>  {
        return response(responseCode);
      })
      .catch((error) => {
        console.log(error, 'EconomyController.transferCurrency()');
      });
  }

  withdrawCurrency(targetUserId, amount) {
    const existingWithdrawal = this.bank.activeWithdrawals[targetUserId];
    
    if (amount === null) {
      if (existingWithdrawal?.isActive) {
        return Promise.resolve(response(responseCodes.economy.bank.existingWithdrawal, existingWithdrawal));
      } else {
        return Promise.resolve(response(responseCodes.economy.bank.noExistingWithdrawal));
      }
    }

    if (amount <= 0) {
      return Promise.resolve(response(responseCodes.positiveValueNeeded));
    }

    return this.db.get(blackguardDbDocNames.economyDoc)
      .then((doc) => {
        const wallet = doc.wallets[targetUserId];

        if (!wallet) {
          return response(responseCodes.doesntExist);
        } else if (wallet.bank - amount < 0) {
          return response(responseCodes.economy.insufficientFunds);
        } else if (existingWithdrawal?.isActive) {
          const oldAmount = this.bank.activeWithdrawals[targetUserId].amount;
          this.bank.activeWithdrawals[targetUserId].amount = amount;
          return response(responseCodes.economy.bank.withdrawalAmountUpdated, oldAmount);
        } else {
          const withdrawalTime = Date.now() + this.bank.withdrawalTime;
          this.bank.activeWithdrawals[targetUserId] = {
            amount,
            withdrawalTime,
            isActive: true,
            timer: setTimeout(() => {
              const thisWithdrawalAttempt = this.bank.activeWithdrawals[targetUserId];
              const amountToWithdrawal = thisWithdrawalAttempt.amount;
              thisWithdrawalAttempt.isActive = false;
              this.commitWithdrawal(targetUserId, amountToWithdrawal);
            }, this.bank.withdrawalTime)
          };

          return response(responseCodes.success, withdrawalTime);
        }
      })
      .catch((error) => {
        console.log(error, 'EconomyController.withdrawCurrency()');
      });
  }

  commitWithdrawal(targetUserId, amount) {
    this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
        const wallet = doc.wallets[targetUserId];
        const expectedBankValue = wallet.bank - amount;

        if (expectedBankValue >= 0) {
          doc.wallets[targetUserId].bank -= amount;
          doc.wallets[targetUserId].value += amount;
        }

        return doc;
      })
      .catch((error) => {
        console.log(error, 'EconomyController.commitWithdrawal()');
      });
  }

  depositCurrency(targetUserId, initialAmount) {
    if (initialAmount <= 0) {
      return Promise.resolve(response(responseCodes.positiveValueNeeded));
    }

    if (`${initialAmount}`.toLowerCase() !== 'max' && isNaN(+initialAmount)) {
      return response(responseCodes.invalidInput);
    }

    let result;

    return this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
      const wallet = doc.wallets[targetUserId];

      if (!wallet) {
        result = response(responseCodes.doesntExist);
      } else {
        const totalTargetValue = wallet.value + wallet.bank;
        const highestAllowedDepositValue = Math.round(totalTargetValue * this.bank.storableValueRatio);

        let amount = +initialAmount;

        if (initialAmount.toLowerCase() === 'max') {
          amount = Math.max(0, wallet.value - highestAllowedDepositValue);
        }

        if (wallet.value === 0 || wallet.value - amount < 0) {
          result = response(responseCodes.economy.insufficientFunds);
        } else if (wallet.bank + amount > highestAllowedDepositValue) {
          result = response(responseCodes.valueTooHigh, highestAllowedDepositValue);
        } else {
          doc.wallets[targetUserId].value -= +amount;
          doc.wallets[targetUserId].bank += +amount;
          result = response(responseCodes.success, amount);
        }
      }
      
      return doc;
    })
      .then(() =>  {
        return result;
      })
      .catch((error) => {
        console.log(error, 'EconomyController.depositCurrency()');
      });
  }

  modifyCurrency(targetUserId, amount, location = currentLocationType.Wallet) {
    let newValue;

    return this.db.get(blackguardDbDocNames.economyDoc)
      .then((doc) => {
        if (!doc.wallets[targetUserId]) {
          return Promise.resolve(response(responseCodes.userDoesNotExist))
        }

        return this.db.upsert(blackguardDbDocNames.economyDoc, (doc) => {
          doc.wallets[targetUserId][location] += amount;

          if (doc.wallets[targetUserId][location] < 0) {
            doc.wallets[targetUserId][location] = 0;
          }

          newValue = doc.wallets[targetUserId][location];
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
    return this.db.get(blackguardDbDocNames.economyDoc)
      .then((doc) => {
        const juggersWallet = doc.wallets[juggerId];

        if (!juggersWallet) {
          result = response(responseCodes.economy.noFromUser);
          return;
        }

        const juggingRoll = Math.random();

        this.startJugCooldown(juggerId);
        const { pve } = this.jugging;
        if (juggingRoll <= pve.baseSuccessChance) {
          const jugValue = Math.round(random(pve.baseRewardFloor, pve.baseRewardCeiling));

          return this.modifyCurrency(juggerId, jugValue)
            .then(() => {
              return response(responseCodes.success, {
                finalJugAmount: jugValue,
                cooldownEndTime: this.jugging.playerCooldowns[juggerId].endTime
              });
            })
            .catch((error) => {
              console.log(error, 'EconomyController.npcJug() -> success modifyCurrency');
            });
        } else {
          return response(responseCodes.failure, this.jugging.playerCooldowns[juggerId].endTime);
        }
      });
  }

  jug(juggerId, juggedId, initialJugBetValue) {
    if (this.jugging.playerCooldowns[juggerId]?.isActive) {
      return response(responseCodes.onCooldown, this.jugging.playerCooldowns[juggerId].endTime);
    }

    if (juggedId === null) {
      return this.npcJug(juggerId);
    }

    if (`${initialJugBetValue}`.toLowerCase() !== 'all' && (isNaN(+initialJugBetValue) || +initialJugBetValue <= 0)) {
      return response(responseCodes.invalidInput);
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

        const jugBetValue = initialJugBetValue.toLowerCase() === 'all' ? juggersWallet.value : +initialJugBetValue;
        if (juggersWallet.value < jugBetValue) {
          result = response(responseCodes.economy.insufficientFunds);
          return;
        }

        const juggingRoll = Math.random();

        this.startJugCooldown(juggerId);
        const { pvp } = this.jugging;
        if (juggingRoll <= pvp.baseSuccessChance) {
          const jugMultiplier = random(pvp.baseRewardFloor, pvp.baseRewardCeiling);
          const idealJugValue = Math.floor(jugBetValue * jugMultiplier);
          const finalJugValue = juggedsWallet.value < idealJugValue ? juggedsWallet.value : idealJugValue;

          result = response(
            responseCodes.success, {
            finalJugAmount: Math.max(finalJugValue, 1),
            cooldownEndTime: this.jugging.playerCooldowns[juggerId].endTime
          });

          return this.transferCurrency(juggedId, juggerId, result.value.finalJugAmount)
            .catch((error) => {
              console.log(error, 'EconomyController.jug() -> success transferCurrency');
            });
        } else {
          const counterRoll = Math.random();

          if (counterRoll <= pvp.baseCounterChance) {
            const counterValue = random(pvp.baseCounterRewardFloor, pvp.baseCounterRewardCeiling);

            result = response(
              responseCodes.economy.jug.counterSuccess, {
              finalJugAmount: Math.max(Math.floor(jugBetValue * counterValue), 1),
              cooldownEndTime: this.jugging.playerCooldowns[juggerId].endTime
            });

            return this.transferCurrency(juggerId, juggedId, result.value.finalJugAmount)
              .then(() => {
                return this.modifyCurrency(juggerId, -jugBetValue);
              })
              .catch((error) => {
                console.log(error, 'EconomyController.jug() -> countered transferCurrency');
              });
          } else {
            result = response(responseCodes.failure, this.jugging.playerCooldowns[juggerId].endTime);

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
