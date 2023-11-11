const {
  blackguardDbDocNames
} = require('../../constants');

class IntroductionAutomatorController {
  constructor(db, initialDoc) {
    this.channelId = null;
    this.messageId = null;
    this.db = db;
    this.load(initialDoc.introductionAutomator);
  }

  load({ channelId, messageId }) {
    this.channelId = channelId ?? null;
    this.messageId = messageId ?? null;
  }

  updateDoc(update) {
    return this.db.upsert(blackguardDbDocNames.guildDoc, (doc) => {
      return {
        ...doc,
        introductionAutomator: {
          ...doc.introductionAutomator,
          ...update
        }
      };
    });
  }

  setChannelId(newChannleId) {
    this.channelId = newChannleId ?? null;
    return this.updateDoc({
      channelId: this.channelId
    });
  }

  setMessageId(newMessageId) {
    this.messageId = newMessageId ?? null;
    return this.updateDoc({
      messageId: this.messageId
    });
  }
}

module.exports = IntroductionAutomatorController;