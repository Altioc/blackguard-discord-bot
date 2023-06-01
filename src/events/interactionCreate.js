const { Events } = require('discord.js');
const ids = require('../ids.json');
const getInteractionType = require('../utils/getInteractionType');
const { interactionTypes } = require('../constants');
const commandInteraction = require('../interactions/command');
const roleSelectMenuInteraction = require('../interactions/roleSelectMenu');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {    
    await interaction.guild.fetch();
    const member = await interaction.member.fetch(true);

    const canAccessCommands = ids.requiredRoles.some((roleId) => (
      member.roles.cache.has(roleId)
    ));

    if (!canAccessCommands) {
      await interaction.reply({
        content: 'Must be a Blackguard member.',
        ephemeral: true
      });
      return;
    }

    switch (getInteractionType(interaction)) {
      case interactionTypes.command: {
        console.log('command executed');
        return commandInteraction.execute(interaction);
      }
      case interactionTypes.roleSelectMenu: {
        console.log('role select menu executed');
        return roleSelectMenuInteraction.execute(interaction);
      }
      default: {
        return;
      }
    }    
	},
};
