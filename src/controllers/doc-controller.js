const { responseCodes } = require('../constants');
const { DocName } = require('../constants/docs');
const BookController = require('../controllers/book-controller');
const EconomyController = require('../controllers/economy-controller');
const response = require('../utils/response');
const RPGController = require('./rpg-controller');
const DbController = require('./base/db-controller');

class DocController extends DbController {
  getDoc(docName, configOnly) {
    return this.db.get(docName)
      .then((doc) => {
        if (configOnly) {
          return response(responseCodes.success, JSON.stringify(doc.config, null, '  '));
        }

        return response(responseCodes.success, JSON.stringify(doc, null, '  '));
      })
      .catch((error) => {
        this.log(error, 'getDoc');
      });
  }

  setDoc(docName, value, configOnly) {
    if (typeof value !== 'object') {
      return Promise.resolve(response(responseCodes.config.setConfig.invalidJSON));
    }

    return this.db.upsert(docName, (doc) => {
      if (configOnly) {
        doc.config = value;
      } else {
        delete value._rev;
        delete value._id;

        doc = {
          ...doc,
          ...value,
        };
      }

      return doc;
    })
      .then(() => {
        switch (docName) {
        case DocName.Book: {
          return BookController.init();
        }
        case DocName.Economy: {
          return EconomyController.init();
        }
        case DocName.RPG: {
          return RPGController.init();
        }
        }
      })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch((error) => {
        this.log(error, 'setConfig -> db.upsert');
      });
  }

  resetDoc(docName) {
    return new Promise((resolve, reject) => {
      switch (docName) {
      case DocName.Economy: {
        return EconomyController.resetDoc()
          .then(EconomyController.init)
          .then(resolve)
          .catch(reject);
      }
      case DocName.Book: {
        return BookController.resetDoc()
          .then(BookController.init)
          .then(resolve)
          .catch(reject);
      }
      case DocName.RPG: {
        return RPGController.resetDoc()
          .then(RPGController.init)
          .then(resolve)
          .catch(reject);
      }
      }
    })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch((error) => {
        this.log(error, 'resetConfig -> controller.resetDoc');
      });
  }
}

module.exports = new DocController();
