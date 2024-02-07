const { create: createModal } = require('../../modals/introduction/helpers');
const standardizeString = require('../../utils/standardizeString');
const { buttonId } = require('./helpers');

module.exports = {
  data: {
    name: buttonId
  },

  interact: async (interaction) => {
    const member = await interaction.member.fetch(true);

    const possibleRoleNames = ['Blackguard', 'Guest', 'Duskfallen'];
    
    const alreadyIntroduced = member.roles.cache.some(role => {
      const standardizedRoleName = standardizeString(role.name);
      const standardizedPossibleRoleNames = possibleRoleNames.map((roleName) => standardizeString(roleName));
      return standardizedPossibleRoleNames.includes(standardizedRoleName);
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