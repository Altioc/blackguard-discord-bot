const { Events } = require('discord.js');
const ids = require('../ids.json');
const getInteractionType = require('../utils/get-interaction-type');
const { InteractionType } = require('../constants');
const commandInteraction = require('../interactions/command');
const stringSelectMenuInteraction = require('../interactions/string-select-menu');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {    
    await interaction.guild.fetch();
    const member = await interaction.member.fetch(true);

    const canAccessCommands = ids.requiredRoles.some(roleId => (
      member.roles.cache.has(roleId)
    ));

    if (!canAccessCommands) {
      await interaction.reply({
        content: 'Must be a Blackguard member.',
        ephemeral: true,
      });
      return;
    }

    switch (getInteractionType(interaction)) {
    case InteractionType.Command: {
      return commandInteraction.execute(interaction);
    }
    case InteractionType.StringSelectMenu: {
      return stringSelectMenuInteraction.execute(interaction);
    }
    default: {
      return;
    }
    }    
  },
};
