module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('occasionalattack')
      .setDescription('throwing in the occasional attack')
      .addStringOption(option => (
        option
          .setName('class')
          .setDescription('The name of the class you may or may not be bad at.')
          .setRequired(false)
      ))
  ),
  
  async execute(interaction) {
    const { options } = interaction;
    const theClass = options.getString('class') || 'nl';

    interaction.reply(`
Not my experience, but i could just be bad at ${theClass}. For me I run out of time on some bosses because its a long wait between binds, and since we only have the 4 minute cd explorer bind I spend most of the boss fight avoiding damage and doing boss mechanics, throwing in the occasional attack, waiting for the next bind so i can burst, and if a bind misses its super frustrating, so its not really until we are funded enough to really melt bosses during a bind that ${theClass} starts to shine. Even if ${theClass} could solo sooner than some classes, spending majority of the fight waiting for binds is not really that fun.
    `);
  }
}
