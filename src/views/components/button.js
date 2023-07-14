const { ButtonBuilder, ButtonStyle } = require('discord.js');

const Button = (label, style, disabled = false) => {
  return new ButtonBuilder()
    .setLabel(label)
    .setCustomId(label)
    .setStyle(style)
    .setDisabled(disabled);
};

const SecondaryButton = ({ label, disabled }) => Button(label, ButtonStyle.Secondary, disabled);
const SuccessButton = ({ label, disabled }) => Button(label, ButtonStyle.Success, disabled);

module.exports = {
  SecondaryButton,
  SuccessButton
};
