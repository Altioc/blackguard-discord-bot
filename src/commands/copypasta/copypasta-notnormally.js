module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('notnormally')
      .setDescription('skilled player but that is not normally...')
      .addStringOption(option => (
        option
          .setName('name')
          .setDescription('The name of skilled player.')
          .setRequired(true)
      ))
  ),
  
  async execute(interaction) {
    const { options } = interaction;
    const name = options.getString('name');

    interaction.reply(`
${name} skilled player but that is not normally, This very very insane..They need to check them pc and game..Maybe they not cheating but maybe they using the game deficit..and this cant seem on screen..
    `);
  },
};
