const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const {
  blackguardDbDocNames,
  initialEconomyDoc,
  responseCodes,
  currentLocationType,
  initialRPGDoc
} = require('../constants');
const Wallet = require('../models/Wallet');
const random = require('../utils/random');
const response = require('../utils/response');

class RPGController {
  constructor() {
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
        this.bank = {
          ...this.bank,
          ...doc.config.bank
        }
        this.jugging.cooldownLength = doc.config.jug.cooldown;
        this.currencyEmoji = doc.config.currencyEmoji;
        this.walletInitialCurrencyAmount = doc.config.wallet.initialCurrencyAmount,
       
      })
      .catch((error) => {
        console.log(error, 'RPGController.initConfig()');
      });
  }
}

module.exports = new RPGController();
