module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('hero')
      .setDescription('Why is Hero a hard class to play?...')
  ),
  
  async execute(interaction) {
    interaction.reply(`
Why is Hero a hard class to play?

Hero's have very short i-frame so you have to SKILLFULLY press the i frame in tough times. The duration of the i-frame is just a second. "The fastest synaptic transmission takes about 1 millisecond. Thus both in terms of spikes and synaptic transmission, the brain can perform at most about a thousand basic operations per second, or 10 million times slower than the computer." This means that in order to correctly press your i frame in critical moments, you have to look at the screen and process this fast pace information with your brain and press your i-frame button.
    `);
  },
};
