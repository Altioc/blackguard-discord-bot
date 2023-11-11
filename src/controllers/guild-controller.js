const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const {
  blackguardDbDocNames,
  initialGuildDoc
} = require('../constants');
const IntroductionAutomatorController = require('./guildSubControllers/introduction-automator-controller');

class GuildController {
  constructor() {
    this.introductionAutomator = null;
    this.db = new PouchDB('BlackguardBotDb');
    this.createGuildDocIfDoesntExist()
      .then(() => {
        return this.loadGuildDoc();
      })
      .catch((error) => {
        console.log(error, 'GuildController.constructor()');
      });
  }

  createGuildDocIfDoesntExist() {
    return this.db.putIfNotExists(blackguardDbDocNames.guildDoc, initialGuildDoc)
      .catch((error) => {
        console.log(error, 'GuildController.createGuildDocIfDoesntExist()');
      });
  }

  resetDoc() {
    return this.db.upsert(blackguardDbDocNames.guildDoc, () => (
      initialGuildDoc
    ));
  }

  loadGuildDoc() {
    return this.db.get(blackguardDbDocNames.guildDoc)
      .then((doc) => {
        this.introductionAutomator = new IntroductionAutomatorController(this.db, doc);
      })
      .catch((error) => {
        console.log(error, 'GuildController.loadGuildDoc()');
      });
  }
}

module.exports = new GuildController();
