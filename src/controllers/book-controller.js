const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const {
  initialBookDoc,
  blackguardDbDocNames,
  responseCodes
} = require('../constants');
const Wager = require('../models/Wager');
const Bet = require('../models/Bet');
const EconomyController = require('./economy-controller');
const response = require('../utils/response');

class BookController {
  constructor() {
    this.latestWager = null;
    this.wagerTimeoutMs = null;
    this.wagerTimeout = null;

    this.db = new PouchDB('BlackguardBotDb');
    this.createBookDocIfDoesntExist()
      .then(() => {
        return this.initConfig()
      })
      .then(() => {
        return this.initLatestWager();
      })
      .catch((error) => {
        console.log(error, 'BookController.constructor()');
      });
  }

  createBookDocIfDoesntExist() {
    return this.db.putIfNotExists(blackguardDbDocNames.bookDoc, initialBookDoc)
      .catch((error) => {
        console.log(error, 'BookController.createBookDocIfDoesntExist()');
      });
  }

  resetDoc() {
    return this.db.upsert(blackguardDbDocNames.bookDoc, () => (
      initialBookDoc
    ));
  }

  initLatestWager() {
    return this.db.get(blackguardDbDocNames.bookDoc)
      .then((doc) => {
        if (doc.latestWager) {
          this.latestWager = new Wager(doc.latestWager);
          this.startLatestWagerTimeout();
        }
      })
      .catch((error) => {
        console.log(error, 'BookController.initLatestWager()');
      });
  }

  initConfig() {
    return this.db.get(blackguardDbDocNames.bookDoc)
      .then((doc) => {
        this.wagerTimeoutMs = doc.config.wagerTimeoutMs;
      })
      .catch((error) => {
        console.log(error, 'BookController.initConfig()');
      });
  }

  startLatestWagerTimeout() {
    this.wagerTimeout = setTimeout(() => {
      if (this.latestWager) {
        this.endWager()
          .then(() => {
            this.rollBackBets();
          })
          .catch((error) => {
            console.log(error, 'BookController.startLatestWagerTimeout() -> timeout');
          });
      }
    }, this.wagerTimeoutMs);
  }

  bet(ownerId, value, option) {
    const newBet = new Bet({ value: 0, option, ownerId });

    if (this.wagerIsValid()) {
      if (!this.latestWager.isOpen) {
        return Promise.resolve(
          response(responseCodes.book.noOpenWager)
        );
      }

      if (this.latestWager.ownerId === ownerId) {
        return Promise.resolve(
          response(responseCodes.book.ownWager)
        );
      }

      return EconomyController.getWallet(ownerId)
        .then(({ value: wallet }) => {
          if (!wallet) {
            return response(responseCodes.doesntExist);
          }

          if (value === 'all') {
            newBet.value = wallet.value;
          } else {
            newBet.value = value;
          }

          if (wallet.value < newBet.value) {
            return response(responseCodes.economy.insufficientFunds);
          }

          const existingBetId = this.latestWager.bets.findIndex(bet => bet.ownerId === ownerId);

          if (existingBetId >= 0) {
            return response(responseCodes.alreadyExists);
          } else {
            this.latestWager.add(newBet);
            return EconomyController.modifyCurrency(ownerId, -value)
              .then(() => {
                return this.saveWager();
              })
              .then(() => {
                return response(
                  responseCodes.success,
                  newBet.value
                );
              })
              .catch((error) => {
                console.log(error, 'BookController.bet() -> EconomyController.modifyCurrency()');
              });
          }
        })
        .catch((error) => {
          console.log(error, 'BookController.bet() -> EconomyController.getWallet()');
        });
    } else {
      return Promise.resolve(
        response(responseCodes.book.noActiveWager)
      );
    }
  }

  startWager(ownerId, premise) {
    if (!this.wagerIsValid()) {
      this.latestWager = new Wager({ ownerId, premise, isOpen: true });
      return this.saveWager()
        .then(() => {
          this.startLatestWagerTimeout();
          return response(responseCodes.success);
        })
        .catch((error) => {
          console.log(error, 'BookController.startWager()');
        });
    }

    return Promise.resolve(response(responseCodes.book.activeWagerAlreadyExists));
  }

  setWagerOpenState(openState) {
    if (this.wagerIsValid()) {

      if (this.latestWager.isOpen !== openState) {
        this.latestWager.setOpen(openState);
        return this.saveWager();
      }

      return Promise.resolve(response(responseCodes.book.setWagerOpenState.wrongState));
    }

    return Promise.resolve(response(responseCodes.book.noActiveWager));
  }


  endWager() {
    if (this.wagerIsValid()) {
      this.latestWager.end();
      return this.saveWager();
    }

    return Promise.resolve(response(responseCodes.book.noActiveWager));
  }

  distributePayout(outcome) {
    if (this.latestWager) {
      const results = this.latestWager.getResults(outcome);

      if (results.winners.length === 0) {
        return Promise.resolve(response(responseCodes.book.distributePayout.noWinners));
      }

      return EconomyController.bulkModifyCurrency(results.winners)
        .then(() => {
          return response(
            responseCodes.success,
            results
          );
        })
        .catch((error) => {
          console.log(error, 'BookController.distributePayout()');
        });
    }

    return Promise.resolve(response(responseCodes.book.noActiveWager));
  }

  rollBackBets() {
    const wagerParticipants = this.latestWager.bets.map((bet) => {
      return { userId: bet.ownerId, value: bet.value };
    });

    if (wagerParticipants.length === 0) {
      return response(responseCodes.rollBackBets.noParticipants);
    }

    return EconomyController.bulkModifyCurrency(wagerParticipants)
      .then(({ responseCode }) => {
        return response(responseCode);
      })
      .catch((error) => {
        console.log(error, 'BookController.rollBackBets()');
      });
  }

  saveWager() {
    return this.db.upsert(blackguardDbDocNames.bookDoc, (doc) => {
      doc.latestWager = this.latestWager.toJsonCompatibleObject();
      return doc;
    })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch((error) => {
        console.log(error, 'BookController.saveWager()');
      });
  }

  wagerIsValid() {
    return this.latestWager && this.latestWager.isActive;
  }
}

module.exports = new BookController();