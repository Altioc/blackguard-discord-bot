const { 
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const buttonId = 'introduction-create';

module.exports = {
  buttonId,
  create: () => {
    return new ButtonBuilder()
      .setCustomId(buttonId)
      .setLabel('Introduce yourself!')
      .setStyle(ButtonStyle.Primary);
  }
};
