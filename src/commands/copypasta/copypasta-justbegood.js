module.exports = {
  subCommandData: (subcommand) =>
    subcommand
    .setName('justbegood')
    .setDescription('interesting :hmmge: just be good...'),

  async execute(interaction) {
    const channel = await interaction.member.guild.channels.fetch(interaction.channelId);
    const hmmgeEmoji = interaction.guild.emojis.cache.find((emoji) => {
      return emoji.name === 'hmmge'
    });

    await interaction.reply(`
interesting
    `);

    await channel.send(
`<:hmmge:${hmmgeEmoji.id}>`
    );
    
    await channel.send(`
just be good at the game instead of bad
it's not hard
    `);
  },
};
