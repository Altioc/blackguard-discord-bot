module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('whodoyouknow')
      .setDescription('i think the entire idea of a boycott is a joke...')
  ),
  
  async execute(interaction) {
    interaction.reply(`
test2
    `);
  }
}