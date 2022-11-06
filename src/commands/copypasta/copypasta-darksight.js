module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('darksight')
      .setDescription('I\'m a level 265 Dual Blade...')
  ),
  
  async execute(interaction) {
    await interaction.reply(`
I'm a level 265 Dual Blade and I just don't undrstand why my friends in the guild always say that I'm playing on a free class. I dont think the skill is that strong actually you often have to play around it and the class is balanced off of drk sight. Even worse Its hard to weave in dark sight with ur attacks making the classes harder than most other ones plus it has a cool down anyway. Im not saying that the classes are bad but im tired of people that dont dodge attacks complaining about us.
    `);
  }
}