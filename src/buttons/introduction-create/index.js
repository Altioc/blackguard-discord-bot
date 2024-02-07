const { create: createModal } = require('../../modals/introduction/helpers');
const { buttonId } = require('./helpers');

module.exports = {
  data: {
    name: buttonId
  },

  interact: async (interaction) => {
    const member = await interaction.member.fetch(true);

    const possibleRoles = ['blackguard', 'guest', 'duskfallen'];
    
    const alreadyIntroduced = member.roles.cache.some(role => {
      const standardizedRoleName = role.name.toLowerCase().trim();
      return possibleRoles.includes(standardizedRoleName);
    });

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