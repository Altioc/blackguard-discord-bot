const { create: createModal } = require('../../modals/introduction/helpers');
const { buttonId } = require('./helpers');

module.exports = {
  data: {
    name: buttonId
  },

  interact: async (interaction) => {
    const member = await interaction.member.fetch(true);
    
    const alreadyIntroduced = false;
    // const alreadyIntroduced = member.roles.cache.some(role => (
    //   role.name.toLowerCase().trim() === "blackguard" ||
    //   role.name.toLowerCase().trim() === "guest"
    // ));

    if (alreadyIntroduced) {
      await interaction.reply({
        content: 'You\'ve already introduced yourself',
        ephemeral: true
      });
    } else {
      const modal = createModal(interaction.user.id);
      await interaction.showModal(modal);
    }
  }
}