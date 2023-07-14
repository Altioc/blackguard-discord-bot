const { InteractionType } = require('../constants');

function getInteractionType(interaction) {
  const expectedInteractionTypes = [
    { name: InteractionType.Command, selected: interaction.isCommand() },
    { name: InteractionType.StringSelectMenu, selected: interaction.isStringSelectMenu() },
  ];

  return expectedInteractionTypes.find(interactionType => interactionType.selected)?.name;
}

module.exports = getInteractionType;
