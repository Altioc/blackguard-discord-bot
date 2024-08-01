const { 
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

const modalId = 'introduction';

const elementIds = {
  preferedName: 'prefered-name',
  pronouns: 'pronouns',
  ign: 'ign',
  referral: 'referral',
  joinReason: 'join-reason'
};

const elementLabels = {
  preferedName: 'Prefered Name',
  pronouns: 'Pronouns',
  ign: 'IGN',
  referral: 'How did you hear about us?',
  joinReason: 'Why do you want to join Blackguard?',
};

module.exports = {
  modalId,
  elementIds,
  elementLabels,
  create: (userId) => {
    const modal = new ModalBuilder()
      .setCustomId(`${modalId}/${userId}`)
      .setTitle('Introduce Yourself');

    const preferedNameInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(elementIds.preferedName)
        .setLabel(elementLabels.preferedName)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(32)
        .setRequired(true)
    );

    const pronounsInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(elementIds.pronouns)
        .setLabel(elementLabels.pronouns)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(1024)
        .setRequired(false)
    );

    const ignInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(elementIds.ign)
        .setLabel(elementLabels.ign)
        .setMaxLength(32)
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    );

    const referralInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(elementIds.referral)
        .setLabel(elementLabels.referral)
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1024)
        .setRequired(true)
    );

    const joinReasonInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(elementIds.joinReason)
        .setLabel(elementLabels.joinReason)
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1024)
        .setRequired(true)
    );

    modal.addComponents(
      preferedNameInput,
      pronounsInput,
      ignInput,
      referralInput,
      joinReasonInput
    );

    return modal;
  }
};
