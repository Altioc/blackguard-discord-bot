module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('blessyourheart')
      .setDescription('Well bless your heart...')
      .addStringOption(option => (
        option
          .setName('name')
          .setDescription('The name player with a blessed heart.')
          .setRequired(true)
      ))
  ),
  
  async execute(interaction) {
    const { options } = interaction;
    const name = options.getString('name');

    interaction.reply(`
Well bless your heart ${name}, it's so nice to have a reasonable discussion where we agree to disagree on this discord
    `);
  },
};
