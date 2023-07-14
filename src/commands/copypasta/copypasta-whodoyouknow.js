module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('whodoyouknow')
      .setDescription('i think the entire idea of a boycott is a joke and you children...')
  ),
  
  async execute(interaction) {
    interaction.reply(`
i think the entire idea of a boycott is a joke and you children should be ashamed of your temper tantrum. please keep your negativity out of my mushroom game, ty. Who the hell do you people know.
    `);
  },
};
