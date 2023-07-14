module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('strengthreward')
      .setDescription('If your party is strong enough to kill the boss...')
  ),
  
  async execute(interaction) {
    interaction.reply(`
If your party is strong enough to kill the boss before you all die out then you still clear the boss. Likewise if you can survive long enough that the boss dies then you still clear the boss.

Easy clears are the reward you get for being strong ya know
    `);
  },
};
