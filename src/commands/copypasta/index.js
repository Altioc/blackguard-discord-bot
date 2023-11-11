const { SlashCommandBuilder } = require('@discordjs/builders');
const { messages } = require('../../constants');
const copypastaDarksight = require('./copypasta-darksight');
const copypastaHero = require('./copypasta-hero');
const copypastaDisgusting = require('./copypasta-disgusting');
const copypastaNotnormally = require('./copypasta-notnormally');
const copypastaStrengthreward = require('./copypasta-strengthreward');
const copypastaOakba = require('./copypasta-oakba');
const copypastaWhodoyouknow = require('./copypasta-whodoyouknow');
const copypastaSillychild = require('./copypasta-sillychild');
const copypastaOccasionalattack = require('./copypasta-occasionalattack');
const copypasta56kadele = require('./copypasta-56kadele.js');
const copypastaMisinformation = require('./copypasta-misinformation');
const copypastaMisplay = require('./copypasta-misplay');
const copypastaBlessyourheart = require('./copypasta-blessyourheart');
const copypastaSinglethought = require('./copypasta-singlethought');
const copypastaRunculvert = require('./copypasta-runculvert');
const copypastaPleaserefrain = require('./copypasta-pleaserefrain');
const copypastaKidstalkingshit = require('./copypasta-kidstalkingshit');
const copypastaJustbegood = require('./copypasta-justbegood');
const copypastaLightnovel = require('./copypasta-lightnovel');
const copypastaImJustDone = require('./copypasta-im-just-done');
const copypastaBoostedlol = require('./copypasta-boostedlol');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('copypasta')
    .setDescription('Easy access to intellectual messages.')
    .addSubcommand(copypastaHero.subCommandData)
    .addSubcommand(copypastaDarksight.subCommandData)
    .addSubcommand(copypastaDisgusting.subCommandData)
    .addSubcommand(copypastaNotnormally.subCommandData)
    .addSubcommand(copypastaStrengthreward.subCommandData)
    .addSubcommand(copypastaOakba.subCommandData)
    .addSubcommand(copypastaWhodoyouknow.subCommandData)
    .addSubcommand(copypastaSillychild.subCommandData)
    .addSubcommand(copypastaOccasionalattack.subCommandData)
    .addSubcommand(copypasta56kadele.subCommandData)
    .addSubcommand(copypastaMisinformation.subCommandData)
    .addSubcommand(copypastaMisplay.subCommandData)
    .addSubcommand(copypastaBlessyourheart.subCommandData)
    .addSubcommand(copypastaSinglethought.subCommandData)
    .addSubcommand(copypastaRunculvert.subCommandData)
    .addSubcommand(copypastaPleaserefrain.subCommandData)
    .addSubcommand(copypastaKidstalkingshit.subCommandData)
    .addSubcommand(copypastaJustbegood.subCommandData)
    .addSubcommand(copypastaLightnovel.subCommandData)
    .addSubcommand(copypastaImJustDone.subCommandData)
    .addSubcommand(copypastaBoostedlol.subCommandData),
       
  requiredRoles: ['Blackguard', 'Guest'],
    
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case 'hero': {
        await copypastaHero.execute(interaction);
        break;
      }
      case 'darksight': {
        await copypastaDarksight.execute(interaction);
        break;
      }
      case 'disgusting': {
        await copypastaDisgusting.execute(interaction);
        break;
      }
      case 'notnormally': {
        await copypastaNotnormally.execute(interaction);
        break;
      }
      case 'strengthreward': {
        await copypastaStrengthreward.execute(interaction);
        break;
      }
      case 'oakba': {
        await copypastaOakba.execute(interaction);
        break;
      }
      case 'whodoyouknow': {
        await copypastaWhodoyouknow.execute(interaction);
        break;
      }
      case 'sillychild': {
        await copypastaSillychild.execute(interaction);
        break;
      }
      case 'occasionalattack': {
        await copypastaOccasionalattack.execute(interaction);
        break;
      }
      case '56kadele': {
        await copypasta56kadele.execute(interaction);
        break;
      }
      case 'misinformation': {
        await copypastaMisinformation.execute(interaction);
        break;
      }
      case 'misplay': {
        await copypastaMisplay.execute(interaction);
        break;
      }
      case 'singlethought': {
        await copypastaSinglethought.execute(interaction);
        break;
      }
      case 'blessyourheart': {
        await copypastaBlessyourheart.execute(interaction);
        break;
      }
      case 'runculvert': {
        await copypastaRunculvert.execute(interaction);
        break;
      }
      case 'pleaserefrain': {
        await copypastaPleaserefrain.execute(interaction);
        break;
      }
      case 'kidstalkingshit': {
        await copypastaKidstalkingshit.execute(interaction);
        break;
      }
      case 'justbegood': {
        await copypastaJustbegood.execute(interaction);
        break;
      }
      case 'lightnovel': {
        await copypastaLightnovel.execute(interaction);
        break;
      }
      case 'imjustdone': {
        await copypastaImJustDone.execute(interaction);
        break;
      }
      case 'boostedlol': {
        await copypastaBoostedlol.execute(interaction);
        break;
      }
      default: {
        await interaction.editReply(messages.unknownError());
      }
    }
  },
};