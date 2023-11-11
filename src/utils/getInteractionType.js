const { interactionTypes } = require('../constants');

function getInteractionType(interaction) {
  const expectedInteractionTypes = [
    { name: interactionTypes.command, selected: interaction.isCommand() },
    { name: interactionTypes.roleSelectMenu, selected: interaction.isRoleSelectMenu() },
    { name: interactionTypes.button, selected: interaction.isButton() },
    { name: interactionTypes.modal, selected: interaction.isModalSubmit() }
  ];

  return expectedInteractionTypes.find(interactionType => interactionType.selected)?.name;
}

module.exports = getInteractionType;