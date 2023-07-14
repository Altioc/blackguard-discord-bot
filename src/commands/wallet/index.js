const { SlashCommandBuilder } = require('@discordjs/builders');
const { messages } = require('../../constants');
const walletCreate = require('./wallet-create');
const walletAdd = require('./wallet-add');
const walletDelete = require('./wallet-delete');
const walletSend = require('./wallet-send');
const walletRead = require('./wallet-read');
const walletDeduct = require('./wallet-deduct');
const walletDeposit = require('./wallet-deposit');
const walletWithdrawal = require('./wallet-withdrawal');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wallet')
    .setDescription('The base command for all things involving wallets.')
    .addSubcommand(walletCreate.subCommandData)
    .addSubcommand(walletAdd.subCommandData)
    .addSubcommand(walletDelete.subCommandData)
    .addSubcommand(walletSend.subCommandData)
    .addSubcommand(walletRead.subCommandData)
    .addSubcommand(walletDeduct.subCommandData)
    .addSubcommand(walletDeposit.subCommandData)
    .addSubcommand(walletWithdrawal.subCommandData),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
    case 'create': {
      await walletCreate.execute(interaction);
      break;
    }
    case 'add': {
      await walletAdd.execute(interaction);
      break;
    }
    case 'delete': {
      await walletDelete.execute(interaction);
      break;
    }
    case 'send': {
      await walletSend.execute(interaction);
      break;
    }
    case 'read': {
      await walletRead.execute(interaction);
      break;
    }
    case 'deduct': {
      await walletDeduct.execute(interaction);
      break;
    }
    case 'deposit': {
      await walletDeposit.execute(interaction);
      break;
    }
    case 'withdrawal': {
      await walletWithdrawal.execute(interaction);
      break;
    }
    default: {
      await interaction.editReply(messages.unknownError());
    }
    }
  },
};
