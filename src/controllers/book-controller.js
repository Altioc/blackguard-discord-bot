const { responseCodes } = require('../constants');
const {
  DocName,
  initialBookDoc,
} = require('../constants/docs');
const Wager = require('../models/wager');
const Bet = require('../models/bet');
const EconomyController = require('./economy-controller');
const response = require('../utils/response');
const DbController = require('./base/db-controller');

class BookController extends DbController {
  constructor() {
    super(DocName.Book, initialBookDoc);
    this.init();
  }

  initConfig(doc) {
    this.latestWager = null;
    this.wagerTimeoutMs = doc.config.wagerTimeoutMs || null;
    this.wagerTimeout = null;

    return this.initLatestWager();
  }

  initLatestWager() {
    return this.db.get(this.docName)
      .then((doc) => {
        if (doc.latestWager) {
          this.latestWager = new Wager(doc.latestWager);
          this.startLatestWagerTimeout();
        }
      })
      .catch((error) => {
        this.log(error, 'initLatestWager');
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
            this.log(error, 'startLatestWagerTimeout -> timeout');
          });
      }
    }, this.wagerTimeoutMs);
  }

  bet(ownerId, value, option) {
    const newBet = new Bet({ value: 0, option, ownerId });

    if (this.wagerIsValid()) {
      if (!this.latestWager.isOpen) {
        return Promise.resolve(
          response(responseCodes.book.noOpenWager),
        );
      }

      if (this.latestWager.ownerId === ownerId) {
        return Promise.resolve(
          response(responseCodes.book.ownWager),
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
                  newBet.value,
                );
              })
              .catch((error) => {
                this.log(error, 'bet -> EconomyController.modifyCurrency');
              });
          }
        })
        .catch((error) => {
          this.log(error, 'bet -> EconomyController.getWallet');
        });
    } else {
      return Promise.resolve(
        response(responseCodes.book.noActiveWager),
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
          this.log(error, 'startWager');
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
            results,
          );
        })
        .catch((error) => {
          this.log(error, 'distributePayout');
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
        this.log(error, 'rollBackBets');
      });
  }

  saveWager() {
    return this.db.upsert(this.docName, (doc) => {
      doc.latestWager = this.latestWager.toJsonCompatibleObject();
      return doc;
    })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch((error) => {
        this.log(error, 'saveWager');
      });
  }

  wagerIsValid() {
    return this.latestWager && this.latestWager.isActive;
  }
}

module.exports = new BookController();
