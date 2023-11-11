const { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, PermissionFlagsBits } = require('discord.js')
const RPGController = require('../../controllers/rpg-controller');
const EconomyController = require('../../controllers/economy-controller');
const Character = require('../../models/Character');
const { equipmentType, responseCodes, messages, messageTypeColors } = require('../../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equipment')
    .setDescription('Shows your equipment data or the equipment data of another person.')
    .addUserOption(option => (
      option
        .setName('target')
        .setDescription('The user whose equipment will be shown. Defaults to your equipment.')
    )),

  requiredRoles: ['Blackguard', 'Guest'],

  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    });
    const { user, options } = interaction;
    const targetUserId = options.getUser('target')?.id || user.id;
    const character = await RPGController.getCharacter(targetUserId);
    
    const weaponResponse = await interaction.editReply(await getEquipmentWindow(equipmentType.Weapon, interaction, targetUserId, character));
    const armorResponse = await interaction.followUp(await getEquipmentWindow(equipmentType.Armor, interaction, targetUserId, character));

    const weaponEnhanceCollector = weaponResponse.createMessageComponentCollector({
      componentType: ComponentType.Button, time: 600000
    });
    weaponEnhanceCollector.on('collect', enhanceButtonInteractionHandler(equipmentType.Weapon, user));
    const armorEnhanceCollector = armorResponse.createMessageComponentCollector({
      componentType: ComponentType.Button, time: 600000
    });
    armorEnhanceCollector.on('collect', enhanceButtonInteractionHandler(equipmentType.Armor, user));

    const failStackDisplay = new EmbedBuilder()
      .setTitle('Fail Stacks')
      .setDescription(`${character.failStacks}`);
      
    await interaction.followUp({
      embeds: [failStackDisplay],
      ephemeral: true
    });
  },
};

function decimalToPercentDisplay(value) {
  return `+${Math.round(value * 100)}%`;
}

function getFlatField(name, currentValue, nextValue, showNextValue) {
  let value = `${currentValue}`;

  if (!isNaN(nextValue) && nextValue !== null && showNextValue) {
    value += ` (${nextValue})`;
  }

  return { name, value, inline: true };
}

function getPercentField(name, currentValue, nextValue, showNextValue) {
  let value = `${decimalToPercentDisplay(currentValue)}`;

  if (!isNaN(nextValue) && nextValue !== null && showNextValue) {
    value += ` (${decimalToPercentDisplay(nextValue)})`;
  }

  return { name, value, inline: true };
}

async function getEquipmentWindow(type, interaction, targetUserId, character) {
  const { user, guild } = interaction;

  const targetUserIsOwner = targetUserId === user.id;
  
  const currencyEmojiName = EconomyController.currencyEmoji.replace(/:/g, '');
  const currenyEmoji = await guild.emojis.fetch()
    .then((emojis) => {
      const currenyEmojiEntry = emojis.find(emoji => emoji.name === currencyEmojiName);
      if (!currenyEmojiEntry) {
        return '🪙';
      }
      return currenyEmojiEntry.id;
    });

  const walletResponse = await EconomyController.getWallet(targetUserId);
  const currentBankBalance = walletResponse?.value?.bank;

  const currentBankBalanceButton = new ButtonBuilder()
    .setCustomId('bank-balance-button')
    .setEmoji('🏛️')
    .setLabel(`${currentBankBalance}`)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  switch (type) {
    case equipmentType.Weapon: {
      const { pve } = RPGController.jugging;
      const { weapon: weaponLevel } = character.equipmentLevels;

      const currentWeapon = RPGController.equipmentStats.weapon[weaponLevel];
      const nextWeapon = RPGController.equipmentStats.weapon[weaponLevel + 1];

      const weaponUpgradeCost = RPGController.equipmentStats.upgrades[weaponLevel]?.cost;
      const weaponUpgradeChance = `${Math.round(RPGController.equipmentStats.upgrades[weaponLevel]?.chance * 100)}%`;

      const currentMinReward = Character.getModifiedRewardValue(currentWeapon.rewardFloor, currentWeapon.rewardModifier);
      const currentMaxReward = Character.getModifiedRewardValue(currentWeapon.rewardCeiling, currentWeapon.rewardModifier);
      const currentPVEMinReward = Math.round(Character.getModifiedRewardValue(pve.baseRewardFloor, currentWeapon.rewardModifier));
      const currentPVEMaxReward = Math.round(Character.getModifiedRewardValue(pve.baseRewardCeiling, currentWeapon.rewardModifier));
  
      const nextMinReward = Character.getModifiedRewardValue(currentWeapon.rewardFloor, nextWeapon?.rewardModifier);
      const nextMaxReward = Character.getModifiedRewardValue(currentWeapon.rewardCeiling, nextWeapon?.rewardModifier);
      const nextPVEMinReward = Math.round(Character.getModifiedRewardValue(pve.baseRewardFloor, nextWeapon?.rewardModifier));
      const nextPVEMaxReward = Math.round(Character.getModifiedRewardValue(pve.baseRewardCeiling, nextWeapon?.rewardModifier));
  
      const weaponWindow = new EmbedBuilder()
        .setTitle('Weapon')
        .setAuthor({ name: `+${weaponLevel}`, iconURL: 'https://blkgrd.com/assets/blkgrd-bot/star-icon.png' })
        .setThumbnail(`https://blkgrd.com/assets/blkgrd-bot/star${weaponLevel}-weapon-icon.png`)
        .addFields([
          getPercentField('Min PVP Reward', currentMinReward, nextMinReward, targetUserIsOwner),
          getPercentField('Max PVP Reward', currentMaxReward, nextMaxReward, targetUserIsOwner),
          { name: ' ', value: ' ' },
          getFlatField('Min PVE Reward', currentPVEMinReward, nextPVEMinReward, targetUserIsOwner),
          getFlatField('Max PVE Reward', currentPVEMaxReward, nextPVEMaxReward, targetUserIsOwner),
        ]);

      const weaponEnhanceButton = new ButtonBuilder()
        .setCustomId('weapon-enhance-button')
        .setLabel('Enhance')
        .setStyle(ButtonStyle.Primary);

      const weaponEnhanceCostButton = new ButtonBuilder()
        .setCustomId('weapon-enhance-cost-button')
        .setEmoji(currenyEmoji)
        .setLabel(`${weaponUpgradeCost} (${weaponUpgradeChance})`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
      
      const weaponEnhanceRow = new ActionRowBuilder().addComponents([
        weaponEnhanceButton,
        weaponEnhanceCostButton,
        currentBankBalanceButton
      ]);

      return {
        embeds: [weaponWindow],
        components: (nextWeapon && targetUserIsOwner) ? [weaponEnhanceRow] : []
      };
    }
    case equipmentType.Armor: {
      const { armor: armorLevel } = character.equipmentLevels;

      const currentArmor = RPGController.equipmentStats.armor[armorLevel];
      const nextArmor = RPGController.equipmentStats.armor[armorLevel + 1];

      const armorUpgradeCost = RPGController.equipmentStats.upgrades[armorLevel]?.cost;
      const armorUpgradeChance = `${Math.round(RPGController.equipmentStats.upgrades[armorLevel]?.chance * 100)}%`;

      const armorFields = [
        getPercentField('Recovery', currentArmor.recovery, nextArmor?.recovery, targetUserIsOwner),     
      ];
  
      if (currentArmor.failStackModifier !== 0) {
        armorFields.push(getPercentField('Fail Stack Value', currentArmor.failStackModifier, nextArmor?.failStackModifier, targetUserIsOwner));
      }
  
      const armorWindow = new EmbedBuilder()
        .setTitle('Armor')
        .setAuthor({ name: `+${armorLevel}`, iconURL: 'https://blkgrd.com/assets/blkgrd-bot/star-icon.png' })
        .setThumbnail(`https://blkgrd.com/assets/blkgrd-bot/star${armorLevel}-armor-icon.png`)
        .addFields(armorFields);
      
      const armorEnhanceButton = new ButtonBuilder()
        .setCustomId('armor-enhance-button')
        .setLabel('Enhance')
        .setStyle(ButtonStyle.Primary);
  
      const armorEnhanceCostButton = new ButtonBuilder()
        .setCustomId('armor-enhance-cost-button')
        .setEmoji(currenyEmoji)
        .setLabel(`${armorUpgradeCost} (${armorUpgradeChance})`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
      
      const armorEnhanceRow = new ActionRowBuilder().addComponents([
        armorEnhanceButton,
        armorEnhanceCostButton,
        currentBankBalanceButton
      ]);  

      return {
        embeds: [armorWindow],
        ephemeral: true,
        components: (nextArmor && targetUserIsOwner) ? [armorEnhanceRow] : []
      }
    }
  }
}

const enhanceButtonInteractionHandler = (type, user) => async (interaction) => {
  try {
    const response = await RPGController.enhanceEquipment(user.id, type);
    const responseCode = response?.responseCode;
    const character = await RPGController.getCharacter(user.id);

    switch (responseCode) {
      case responseCodes.success: {
        await interaction.update(await getEquipmentWindow(type, interaction, user.id, character));
        break;
      }
      case responseCodes.failure: {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Failure')
              .setColor(messageTypeColors.success)
              .setDescription(`The enhancement failed.`)
          ],
          ephemeral: true
        });
        break;
      }
      case responseCodes.doesntExist: {
        await interaction.reply(messages.authorNoWallet());
        break;
      }
      case responseCodes.economy.insufficientFunds: {
        await interaction.reply(messages.insufficientFunds());
        break;
      }
      default: {
        interaction.reply(messages.unknownError());
      }
    }
  } catch (error) {
    console.log(error, 'equipment.execute() -> RPGController.enhanceEquipment()');
    interaction.reply(messages.unknownError());
  }
}