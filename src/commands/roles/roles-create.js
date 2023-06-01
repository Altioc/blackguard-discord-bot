const { 
  ActionRowBuilder, 
  PermissionFlagsBits, 
  RoleSelectMenuBuilder, 
  ChannelSelectMenuBuilder, 
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ChannelType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const { messages } = require('../../constants');

module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('create')
      .setDescription('Creates a role selector')
      .addStringOption(option => (
        option
          .setName('title')
          .setDescription('The title for the role selector post.')
          .setRequired(true)
      ))
      .addBooleanOption(option => (
        option
          .setName('multiselect')
          .setDescription('Whether or not to allow users to select multiple roles. Defaults to: false')
      ))
  ),

  async execute(interaction) {
    const { memberPermissions, options } = interaction;
    const title = options.getString('title');
    const canSelectMultiple = options.getBoolean('multiselect');

    if (!memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply(messages.incorrectPermissions());
      return;
    }

    const allRoleSelectMenu = new RoleSelectMenuBuilder()
      .setCustomId('totalRoleSelect')
      .setPlaceholder('Select roles')
      .setMinValues(1)
			.setMaxValues(25);
    
    const channelSelectMenu = new ChannelSelectMenuBuilder()
      .setCustomId('roleSelectChannelSelect')
      .setPlaceholder('Select channel')
      .setChannelTypes([ChannelType.GuildText]);
    
    const submitButton = new ButtonBuilder()
      .setCustomId('roleSelectCreateButton_submit')
      .setStyle(ButtonStyle.Success)
      .setLabel('Submit');
    
    const cancelButton = new ButtonBuilder()
      .setCustomId('roleSelectCreateButton_cancel')
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Cancel');

		const roleSelectCreateRow = new ActionRowBuilder().addComponents(allRoleSelectMenu);
    const channelSelectRow = new ActionRowBuilder().addComponents(channelSelectMenu);
    const buttonsRow = new ActionRowBuilder().addComponents(submitButton, cancelButton);

    const response = await interaction.reply({
			content: 'Select all potentially allowed roles (max 25) and the channel you want the selector in.',
      ephemeral: true,
			components: [
        roleSelectCreateRow,
        channelSelectRow,
        buttonsRow
      ],
		});

    const roleSelectCollector = response.createMessageComponentCollector({ 
      componentType: ComponentType.RoleSelect
    });
    let rolesSelection;
    roleSelectCollector.on('collect', (interaction) => {
      interaction.deferUpdate();
      rolesSelection = interaction.roles;
    });

    const channelSelectCollector = response.createMessageComponentCollector({ 
      componentType: ComponentType.ChannelSelect
    });
    let channelSelection;
    channelSelectCollector.on('collect', (interaction) => {
      interaction.deferUpdate();
      channelSelection = interaction.channels.first();
    });

    const buttonCollector = response.createMessageComponentCollector({ 
      componentType: ComponentType.Button
    });
    buttonCollector.on('collect', async (interaction) => {
      const { customId } = interaction;
      if (customId.endsWith('cancel')) {
        return await interaction.update({
          content: 'Role selection creation canceled.',
          components: []
        });
      }

      if (customId.endsWith('submit')) {
        const roleSelectMenu = new StringSelectMenuBuilder()
          .setCustomId('test')
          .setPlaceholder(canSelectMultiple ? 'Select roles' : 'Select role')
          .setMinValues(0)
          .setMaxValues(canSelectMultiple ? 25 : 1)
          .addOptions(
            ...rolesSelection.map((role) => {
              const option = new StringSelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.id);

              if (role.icon) {
                option.setEmoji(role.icon);
              }

              return option;
            })
          );

        const roleSelectMenuRow = new ActionRowBuilder().addComponents(roleSelectMenu);

        await channelSelection.send({
          content: title,
          components: [roleSelectMenuRow]
        });

        return await interaction.update({
          content: `${rolesSelection.size} ${channelSelection.name} Submitted`,
          components: []
        });
      }
    });
  }
}