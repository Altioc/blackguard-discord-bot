const { SlashCommandBuilder } = require('@discordjs/builders');
const { messages } = require('../../constants');
const economyClearjugcooldown = require('./economy-clearjugcooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Attempts to jug someone elses bilaims with a small chance for a counter jug on failure.')
    .addSubcommand(economyClearjugcooldown.subCommandData),

  async execute(interaction) {
    await interaction.deferReply();
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
    case 'clear-jug-cooldown': {
      economyClearjugcooldown.execute(interaction);
      break;
    }
    default: {
      await interaction.editReply(messages.unknownError());
    }
    }
  },
};
