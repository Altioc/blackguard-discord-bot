const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const {
  messageTypeColors,
  responseCodes,
  messages
} = require('../../constants');
const EconomyController = require('../../controllers/economy-controller');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jug')
    .setDescription('Attempts to jug someone elses bilaims with a small chance for a counter jug on failure.')
    .addUserOption(option => (
      option
        .setName('target')
        .setDescription('The user to attempt to jug.')
    ))
    .addStringOption(option => (
      option
        .setName('value')
        .setDescription('The amount to wager on the jug or "all" if you want to use all available funds as your jug wager.')
    )),

  async execute(interaction) {
    await interaction.deferReply()

    const { user, options, guild } = interaction;
    const targetUserId = options.getUser('target')?.id;
    let target = null;
    if (targetUserId) {
      target = await guild.members.fetch(targetUserId);
    }
    const value = options.getString('value');

    const targetId = target === null ? null : target.id;

    try {
      const { responseCode, value: responseValue } = await EconomyController.jug(user.id, targetId, value);

      switch (responseCode) {
        case responseCodes.success: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Success')
                .setColor(messageTypeColors.success)
                .setDescription(`You have sucessfully jugged ${EconomyController.currencyEmoji} ${responseValue.finalJugAmount} from ${target?.displayName ?? 'monsters'}.`)
                .setFields([
                  { name: 'Cooldown', value: time(new Date(responseValue.cooldownEndTime), 'R') }
                ])
            ]
          });
          break;
        }
        case responseCodes.invalidInput: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Invalid Jug Value')
                .setColor(messageTypeColors.failure)
                .setDescription(`The provided jug value: ${value} is not a postive integer or the word "all".`)
            ]
          });
          break;
        }
        case responseCodes.economy.jug.counterSuccess: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Counter')
                .setColor(messageTypeColors.success)
                .setDescription(`You tried to jug ${target.displayName} but instead you got jugged for ${EconomyController.currencyEmoji} ${responseValue.finalJugAmount}.`)
                .setFields([
                  { name: 'Cooldown', value: time(new Date(responseValue.cooldownEndTime), 'R') }
                ])
            ]
          });
          break;
        }
        case responseCodes.failure: {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Failure')
                .setColor(messageTypeColors.success)
                .setDescription(`You failed to jug ${target?.displayName ?? 'monsters'}.`)
                .setFields([
                  { name: 'Cooldown', value: time(new Date(responseValue), 'R') }
                ])
            ]
          });
          break;
        }
        case responseCodes.onCooldown: {
          const offCooldownTime = responseValue;
          await interaction.editReply(
            messages.onCooldown(
              time(new Date(offCooldownTime), 'R')
            )
          );
          break;
        }
        case responseCodes.economy.noFromUser: {
          await interaction.editReply(messages.authorNoWallet());
          break;
        }
        case responseCodes.economy.noToUser: {
          await interaction.editReply(messages.targetNoWallet(target.displayName));
          break;
        }
        case responseCodes.economy.sameUser: {
          await interaction.editReply(messages.invalidTarget('You cannot jug yourself.'));
          break;
        }
        case responseCodes.economy.insufficientFunds: {
          await interaction.editReply(messages.insufficientFunds());
          break;
        }
        default: {
          interaction.editReply(messages.unknownError());
        }
      }
    } catch (error) {
      console.log(error, 'jug.execute() -> EconomyController.jug()');
      interaction.editReply(messages.unknownError());
    }
  },
};