const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const StringSelect = ({ options, placeholder, id, selectedOptions }) => {
  return new StringSelectMenuBuilder()
    .setCustomId(id)
    .setPlaceholder(placeholder)
    .setMinValues(1)
    .setMaxValues(Math.min(options.length, 25))
    .addOptions(
      options.map(({ id, name, icon }) => {
        const selectedStatusIcon = selectedOptions.has(id) ? '✅' : '⬛';
        const newStringOption = new StringSelectMenuOptionBuilder()
          .setLabel(`${selectedStatusIcon} ${name}`.substring(0, 100))
          .setValue(id);
  
        if (icon) {
          newStringOption.setEmoji(icon);
        }
  
        return newStringOption;
      }),
    );
};

module.exports = {
  StringSelect,
};
