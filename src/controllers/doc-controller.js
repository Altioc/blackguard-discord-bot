const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const {
  blackguardDbDocNames,
  responseCodes
} = require('../constants');
const BookController = require('../controllers/book-controller');
const EconomyController = require('../controllers/economy-controller');
const response = require('../utils/response');

class DocController {
  constructor() {
    this.db = new PouchDB('BlackguardBotDb');
  }

  getDoc(docNameKey, configOnly) {
    return this.db.get(blackguardDbDocNames[docNameKey])
      .then((doc) => {
        if (configOnly) {
          return response(responseCodes.success, JSON.stringify(doc.config, null, '  '));
        }

        return response(responseCodes.success, JSON.stringify(doc, null, '  '));
      })
      .catch((error) => {
        console.log(error, 'DocController.getDoc()');
      });
  }

  setDoc(docNameKey, value, configOnly) {
    if (typeof value !== 'object') {
      return Promise.resolve(response(responseCodes.config.setConfig.invalidJSON));
    }

    return this.db.upsert(blackguardDbDocNames[docNameKey], (doc) => {
      if (configOnly) {
        doc.config = value;
      } else {
        delete value._rev;
        delete value._id;

        doc = {
          ...doc,
          ...value
        };
      }

      return doc;
    })
      .then(() => {
        if (blackguardDbDocNames[docNameKey] === blackguardDbDocNames.bookDoc) {
          return BookController.initConfig();
        } else if (blackguardDbDocNames[docNameKey] === blackguardDbDocNames.economyDoc) {
          return EconomyController.initConfig();
        }
      })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch((error) => {
        console.log(error, 'DocController.setConfig() -> db.upsert()');
      });
  }

  resetDoc(docNameKey) {
    return new Promise((resolve, reject) => {
      switch (docNameKey) {
        case blackguardDbDocNames.economyDoc: {
          EconomyController.resetDoc()
            .then(() => {
              return EconomyController.initConfig()
            })
            .then(resolve)
            .catch(reject);
          break;
        }
        case blackguardDbDocNames.bookDoc: {
          BookController.resetDoc()
            .then(() => {
              return BookController.initConfig()
            })
            .then(resolve)
            .catch(reject);
          break;
        }
      }
    })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch((error) => {
        console.log(error, 'DocController.resetConfig() -> controller.createInitialDoc()');
      });
  }
}

module.exports = new DocController();