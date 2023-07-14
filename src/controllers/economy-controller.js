const {
  responseCodes,
  CurrentLocationType,
  minute,
} = require('../constants');
const {
  initialEconomyDoc,
  DocName,
} = require('../constants/docs');
const Wallet = require('../models/wallet');
const response = require('../utils/response');
const DbController = require('./base/db-controller');

class EconomyController extends DbController {
  constructor() {
    super(DocName.Economy, initialEconomyDoc);
    this.init();
  }

  async initConfig(doc) {
    this.bank = {
      interestRate: null,
      storableValueRatio: null,
      withdrawalTime: null,
      activeWithdrawals: {},
      ...doc.config.bank,
    };
    this.currencyEmoji = doc.config.currencyEmoji || null;
    this.walletInitialCurrencyAmount = doc.config.wallet.initialCurrencyAmount || null;
    this.bankInterestInterval = null;
    this.nextInterestPayoutDate = null;

    if (doc.nextInterestPayoutDate) {
      this.nextInterestPayoutDate = new Date(doc.nextInterestPayoutDate);
    }
    
    this.startInterestSystem();
  }

  getCurrentDate() {
    const currentDate = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    return currentDate;
  }

  startInterestSystem() {
    clearInterval(this.bankInterestInterval);
    this.bankInterestInterval = setInterval(() => {
      if (this.nextInterestPayoutDate === null || this.getCurrentDate() > this.nextInterestPayoutDate) {
        this.db.upsert(this.docName, (doc) => {
          const newNextInterestPayoutDate = new Date(this.getCurrentDate());
          newNextInterestPayoutDate.setDate(newNextInterestPayoutDate.getDate() + 1);
          doc.nextInterestPayoutDate = newNextInterestPayoutDate.toString();
          this.nextInterestPayoutDate = newNextInterestPayoutDate;

          Object.entries(doc.wallets).forEach(([userId]) => {
            doc.wallets[userId].bank = Math.floor(doc.wallets[userId].bank * (1 + this.bank.interestRate));
          });
  
          return doc;
        })
          .catch((error) => {
            this.log(error, 'startInterestSystem');
          });
      }
    }, 5 * minute);
  }

  async saveLastInterestPayout() {

  }

  createWallet(userId) {
    let responseCode = responseCodes.success;

    return this.db.upsert(this.docName, (doc) => {
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
        this.log(error, 'createWallet');
      });
  }

  getWallet(userId) {
    return this.db.get((this.docName))
      .then((doc) => {
        const responseCode = doc.wallets[userId] ? responseCodes.success : responseCodes.doesntExist;

        return response(responseCode, doc.wallets[userId]);
      })
      .catch((error) => {
        this.log(error, 'getWallet');
      });
  }

  getAllWallets() {
    return this.db.get((this.docName))
      .then((doc) => {
        return response(responseCodes.success, doc.wallets);
      })
      .catch((error) => {
        this.log(error, 'getAllWallets');
      });
  }

  deleteWallet(userId) {
    let responseCode = responseCodes.success;
    return this.db.upsert(this.docName, (doc) => {
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
        this.log(error, 'deleteWallet');
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

    return this.db.upsert(this.docName, (doc) => {
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
        this.log(error, 'transferCurrency');
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

    return this.db.get(this.docName)
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
            }, this.bank.withdrawalTime),
          };

          return response(responseCodes.success, withdrawalTime);
        }
      })
      .catch((error) => {
        this.log(error, 'withdrawCurrency');
      });
  }

  commitWithdrawal(targetUserId, amount) {
    this.db.upsert(this.docName, (doc) => {
      const wallet = doc.wallets[targetUserId];
      const expectedBankValue = wallet.bank - amount;

      if (expectedBankValue >= 0) {
        doc.wallets[targetUserId].bank -= amount;
        doc.wallets[targetUserId].value += amount;
      }

      return doc;
    })
      .catch((error) => {
        this.log(error, 'commitWithdrawal');
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

    return this.db.upsert(this.docName, (doc) => {
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
        this.log(error, 'depositCurrency');
      });
  }

  modifyCurrency(targetUserId, amount, location = CurrentLocationType.Wallet) {
    let newValue;

    return this.db.get(this.docName)
      .then((doc) => {
        if (!doc.wallets[targetUserId]) {
          return Promise.resolve(response(responseCodes.userDoesNotExist));
        }

        return this.db.upsert(this.docName, (doc) => {
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
              newValue,
            );
          })
          .catch((error) => {
            this.log(error, 'modifyCurrency -> db.upsert');
          });

      })
      .catch((error) => {
        this.log(error, 'modifyCurrency -> db.get');
      });

  }

  bulkModifyCurrency(modifications) {
    return this.db.upsert(this.docName, (doc) => {
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
        this.log(error, 'bulkModifyCurrency');
      });
  }
}

module.exports = new EconomyController();
