const { SlashCommandBuilder } = require('@discordjs/builders');
const { messages } = require('../../constants');
const wagerBet = require('./wager-bet');
const wagerClose = require('./wager-close');
const wagerEnd = require('./wager-end');
const wagerOpen = require('./wager-open');
const wagerReactivate = require('./wager-reactivate');
const wagerRead = require('./wager-read');
const wagerStart = require('./wager-start');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wager')
    .setDescription('The base command for all things involving wagers.')
    .addSubcommand(wagerBet.subCommandData)
    .addSubcommand(wagerClose.subCommandData)
    .addSubcommand(wagerEnd.subCommandData)
    .addSubcommand(wagerOpen.subCommandData)
    .addSubcommand(wagerReactivate.subCommandData)
    .addSubcommand(wagerRead.subCommandData)
    .addSubcommand(wagerStart.subCommandData),

  async execute(interaction) {
    await interaction.deferReply()
    const subCommand = interaction.options.getSubcommand()

    switch (subCommand) {
      case 'bet': {
        await wagerBet.execute(interaction);
        break;
      }
      case 'close': {
        await wagerClose.execute(interaction);
        break;
      }
      case 'end': {
        await wagerEnd.execute(interaction);
        break;
      }
      case 'open': {
        await wagerOpen.execute(interaction);
        break;
      }
      case 'reactivate': {
        await wagerReactivate.execute(interaction);
        break;
      }
      case 'read': {
        await wagerRead.execute(interaction);
        break;
      }
      case 'start': {
        await wagerStart.execute(interaction);
        break;
      }
      default: {
        await interaction.editReply(messages.unknownError());
      }
    }
  },
};