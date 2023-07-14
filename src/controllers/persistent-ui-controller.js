const { responseCodes } = require('../constants');
const {
  DocName,
  initialPersistentUiDoc,
} = require('../constants/docs');
const response = require('../utils/response');
const DbController = require('./base/db-controller');

class PersistentUiController extends DbController {
  constructor() {
    super(DocName.PersistentUi, initialPersistentUiDoc);
    this.init();
  }

  initConfig(doc) {
    this.uiElements = doc.uiElements || {};
  }

  hasUi(messageId) {
    return this.uiElements[messageId];
  }

  async deleteUi(messageId, guild) {
    return this._deleteDiscordMessage(messageId, guild)
      .then((discordDeleteResponse) => {
        if (discordDeleteResponse === responseCodes.success) {
          return this.db.upsert(this.docName, (doc) => {
            delete doc.uiElements[messageId];
            delete this.uiElements[messageId];
              
            return doc;
          })
            .then(() => {
              return response(responseCodes.success);
            });
        }

        return discordDeleteResponse;
      })
      .catch((error) => {
        this.log(error, 'deleteUi');
      });
  }

  async _deleteDiscordMessage(messageId, guild) {
    const { channelId } = this.uiElements[messageId];

    return guild.channels.fetch(channelId)
      .then((channel) => {
        return channel?.messages.fetch(messageId);
      })
      .then((message) => {
        return message?.delete();
      })
      .then(() => {
        return response(responseCodes.success);
      })
      .catch(() => {
        return response(responseCodes.discord.ui.doesntExist);
      });
  }
}

module.exports = new PersistentUiController();
