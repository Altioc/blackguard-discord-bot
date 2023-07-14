const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));

module.exports = class DbController {
  constructor(docName, initialDoc) {
    this.docName = docName;
    this.initialDoc = initialDoc;
    this.db = new PouchDB('BlackguardBotDb');
  }

  init() {
    this._createDocIfDoesntExist(this.docName, this.initialDoc)
      .then(() => {
        return this._initConfig();
      })
      .catch((error) => {
        this.log(error, 'init');
      });
  }

  resetDoc() {
    return this.db.upsert(this.docName, () => (
      this.initialDoc
    ))
      .catch((error) => {
        this.log(error, 'resetDoc');
      });
  }

  log(error, description) {
    console.log(error, this.constructor.name, description);
  }

  _createDocIfDoesntExist() {
    return this.db.putIfNotExists(this.docName, this.initialDoc)
      .catch((error) => {
        this.log(error, '_createDocIfDoesntExist');
      });
  }

  _initConfig() {
    return this.db.get(this.docName)
      .then((doc) => {
        return this.initConfig?.(doc);
      })
      .catch((error) => {
        this.log(error, '_initConfig');
      });
  }
};
