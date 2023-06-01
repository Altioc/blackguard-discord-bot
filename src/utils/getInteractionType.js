const { interactionTypes } = require('../constants');

function getInteractionType(interaction) {
  const expectedInteractionTypes = [
    { name: interactionTypes.command, selected: interaction.isCommand() },
    { name: interactionTypes.roleSelectMenu, selected: interaction.isRoleSelectMenu() },
  ];

  return expectedInteractionTypes.find(interactionType => interactionType.selected)?.name;
}

module.exports = getInteractionType;