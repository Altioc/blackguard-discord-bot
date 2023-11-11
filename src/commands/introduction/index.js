const { SlashCommandBuilder } = require('@discordjs/builders');
const { messages } = require('../../constants');
const introductionCreate = require('./introduction-create');
const introductionDelete = require('./introduction-delete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('introduction-automator')
    .setDescription('Create/Delete the introduction automator')
    .addSubcommand(introductionCreate.subCommandData)
    .addSubcommand(introductionDelete.subCommandData),

  requiredRoles: [],
  
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    });
    
    const subCommand = interaction.options.getSubcommand()

    switch (subCommand) {
      case 'create': {
        await introductionCreate.execute(interaction);
        break;
      }
      case 'delete': {
        await introductionDelete.execute(interaction);
        break;
      }
      default: {
        await interaction.editReply(messages.unknownError());
      }
    }

  },
};