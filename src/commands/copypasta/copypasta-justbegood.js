module.exports = {
  subCommandData: subcommand =>
    subcommand
      .setName('justbegood')
      .setDescription('interesting :hmmge: just be good...'),

  async execute(interaction) {
    const channel = await interaction.member.guild.channels.fetch(interaction.channelId);
    const hmmletEmoji = interaction.guild.emojis.cache.find((emoji) => {
      return emoji.name === 'hmmlet';
    });

    let emoji = '🤔';

    if (hmmletEmoji) {
      emoji = `<:hmmlet:${hmmletEmoji.id}>`;
    }

    await interaction.reply(`
interesting
    `);

    await channel.send(emoji);
    
    await channel.send(`
just be good at the game instead of bad
it's not hard
    `);
  },
};
