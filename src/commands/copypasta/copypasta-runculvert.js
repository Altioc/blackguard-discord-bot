module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('runculvert')
      .setDescription('Run culvert early before toben buffs epxire...')
  ),
  
  async execute(interaction) {
    interaction.reply(`
Run culvert early before toben buffs expire. Some of your guys' scores are dogshit and I already have a list of who I'm going to kick based on those if they don't improve, including sandbaggers. If you need help with your rotation message me and I will find someone to show you how to do it. Also, we shouldn't have to be spam pinging you guys at the last minute to get your runs in and It's literally fucking 5 minutes of your time per week, if you can't try your best for 5 minutes then let me know so I can give someone else your slot who wants to be here.
    `);
  },
};
