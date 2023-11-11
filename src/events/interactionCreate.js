const { Events } = require('discord.js');
const getInteractionType = require('../utils/getInteractionType');
const { interactionTypes } = require('../constants');
const commandInteraction = require('../interactions/command');
const roleSelectMenuInteraction = require('../interactions/roleSelectMenu');
const buttonInteraction = require('../interactions/button');
const modalInteraction = require('../interactions/modal');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {    
    await interaction.guild.fetch();
    
    switch (getInteractionType(interaction)) {
      case interactionTypes.command: {
        return commandInteraction.execute(interaction);
      }
      case interactionTypes.roleSelectMenu: {
        return roleSelectMenuInteraction.execute(interaction);
      }
      case interactionTypes.button: {
        return buttonInteraction.execute(interaction);
      }
      case interactionTypes.modal: {
        return modalInteraction.execute(interaction);
      }
      default: {
        return;
      }
    }    
	},
};
