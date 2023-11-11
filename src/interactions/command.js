const handlers = require('../constants/interactionHandlers');

module.exports = {
	async execute(interaction) {    
    const { commandName } = interaction
    const command = handlers.commands.get(commandName);

    if (!command) {
      return;
    }

    const member = await interaction.member.fetch(true);
    const requiredRoles = command.requiredRoles;

    const canAccessCommands = requiredRoles.some((roleName) => (
      member.roles.cache.some(role => {
        return role.name.toLowerCase().trim() === roleName.toLowerCase().trim()
      })
    ));

    if (!canAccessCommands) {
      await interaction.reply({
        content: 'You do not have permission to run this command.',
        ephemeral: true
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(error, 'command->execute');
    }
  }
};
