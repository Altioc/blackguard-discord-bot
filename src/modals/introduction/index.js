const { EmbedBuilder } = require('discord.js');
const {
  deleteIntroductionAutomatorButton,
  createIntroductionAutomatorButton
} = require('../../commands/introduction/helpers');
const { modalId, elementIds, elementLabels } = require('./helpers');

module.exports = {
  data: {
    name: modalId
  },

  interact: async (interaction, [userId]) => {
    await deleteIntroductionAutomatorButton(interaction.guild);

    const { fields } = interaction;
    const preferedName = fields.getTextInputValue(elementIds.preferedName);
    const ign = fields.getTextInputValue(elementIds.ign);
    const pronouns = fields.getTextInputValue(elementIds.pronouns);
    const referral = fields.getTextInputValue(elementIds.referral);
    const joinReason = fields.getTextInputValue(elementIds.joinReason);

    const user = await interaction.guild.members.fetch({
      user: userId,
      force: true
    });

    try {
      let newNickname = preferedName;

      if (ign) {
        newNickname += `(${ign})`;
      }

      await user.setNickname(newNickname);
    } catch {}

    const optionalFields = [];

    if (pronouns) {
      optionalFields.push({ name: elementLabels.pronouns, value: pronouns, inline: true });
    }

    if (ign) {
      optionalFields.push({ name: elementLabels.ign, value: ign, inline: true });
    }

    const introduction = new EmbedBuilder()
      .setDescription(`${user}`)
      .addFields(
        { name: elementLabels.preferedName, value: preferedName, inline: true },
        ...optionalFields,
        { name: elementLabels.referral, value: referral },
        { name: elementLabels.joinReason, value: joinReason }
      )
      .setImage(user.displayAvatarURL())
      .setTimestamp();

    await interaction.channel.send({ embeds: [introduction] });

    await createIntroductionAutomatorButton(interaction.channel);
    await interaction.reply({
      content: 'Introduction submitted! Thank you',
      ephemeral: true
    });
  }
}