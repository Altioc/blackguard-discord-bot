const { SlashCommandBuilder } = require('@discordjs/builders');
const { messages } = require('../../constants');
const docGet = require('./doc-get');
const docSet = require('./doc-set');
const docReset = require('./doc-reset');
const ids = require('../../ids.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doc')
    .setDescription('The base command for all things involving docs.')
    .addSubcommand(docGet.subCommandData)
    .addSubcommand(docSet.subCommandData)
    .addSubcommand(docReset.subCommandData),

  requiredRoles: ['Blackguard'],

  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    });
    const subCommand = interaction.options.getSubcommand();

    if (!ids.superUsers.includes(interaction.member.id)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    switch (subCommand) {
      case 'get': {
        await docGet.execute(interaction);
        break;
      }
      case 'set': {
        await docSet.execute(interaction);
        break;
      }
      case 'reset': {
        await docReset.execute(interaction);
        break;
      }
      default: {
        await interaction.editReply(messages.unknownError());
      }
    }
  },
};