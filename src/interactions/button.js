const handlers = require('../constants/interactionHandlers');

module.exports = {
	async execute(interaction) {    
    const { customId } = interaction
    const [buttonId, ...parts] = customId.split('/');
    const button = handlers.buttons.get(buttonId);

    if (!button) {
      return;
    }
  
    try {
      await button.interact(interaction, parts);
    } catch (error) {
      console.log(error, 'button->interact');
    }
  }
};
