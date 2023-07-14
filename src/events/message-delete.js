const { Events } = require('discord.js');
const PersistentUiController = require('../controllers/persistent-ui-controller');

module.exports = {
  name: Events.MessageDelete,
  execute({ id, guild }) {
    if (PersistentUiController.hasUi(id)) {
      PersistentUiController.deleteUi(id, guild);
    }
  },
};
