module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('misplay')
      .setDescription('some people might think it\'s a misplay...')
  ),
  
  async execute(interaction) {
    interaction.reply(`
some people might think it's a misplay. since it was intentional, you lined it up and demonstrated high level of game mechanics/physics. you make this play not because you have to, it's because you can
    `);
  }
}