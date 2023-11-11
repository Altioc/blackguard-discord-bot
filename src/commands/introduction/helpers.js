const GuildController = require('../../controllers/guild-controller');
const { create: createButton } = require('../../buttons/introduction-create/helpers');
const { ActionRowBuilder } = require('discord.js');

module.exports = {
  createIntroductionAutomatorButton: async (channel) => {
    const newButton = createButton();
    const row = new ActionRowBuilder().addComponents(newButton);
    const newMessage = await channel.send({
      components: [row]
    });
    await GuildController.introductionAutomator.setMessageId(newMessage.id);
  },

  deleteIntroductionAutomatorButton: async (guild) => {
    const { 
      channelId: oldChannelId,
      messageId: oldMessageId
    } = GuildController.introductionAutomator;
  
    await GuildController.introductionAutomator.setMessageId(null);
  
    try {
      const oldChannel = await guild.channels.fetch(oldChannelId, { force: true });
      const oldMessage = await oldChannel.messages.fetch(oldMessageId);
      await oldMessage.delete();
      return true;
    } catch {
      return false;
    }
  }
};
