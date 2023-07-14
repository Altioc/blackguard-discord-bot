const { ActionRowBuilder } = require('discord.js');

const Row = (...children) => {
  return new ActionRowBuilder()
    .addComponents(
      ...children,
    );
};

module.exports = { 
  Row,
};
