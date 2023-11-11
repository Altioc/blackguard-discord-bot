const handlers = require('../constants/interactionHandlers');

module.exports = {
	async execute(interaction) {    
    const { customId } = interaction
    console.log(customId);
    const [modalId, ...parts] = customId.split('/');
    const modal = handlers.modals.get(modalId);

    if (!modal) {
      return;
    }
  
    try {
      await modal.interact(interaction, parts);
    } catch (error) {
      console.log(error, 'modal->interact');
    }
  }
};
