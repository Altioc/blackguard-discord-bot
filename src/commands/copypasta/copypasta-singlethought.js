module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('singlethought')
      .setDescription('Did a single fucking thought go through ...')
  ),
  
  async execute(interaction) {
    interaction.reply(`
Did a single fucking thought go through the 2 and a half workers at Nexon NAs headquarters when they announced the removal of wild totems? This game has been built on totems - I don't care if the Koreans play without totems I'm AMERICAN and REFUSE to wait for spawn between each wave of mobs. When my friends showed me the maple memo today, I had to excuse myself from my desk at work and have a mental breakdown in the bathroom. This is ridiculous what the hell are we supposed to do now?? My rates at CLP are going to tank with the removal of wild totems, and I won't have enough nodestone income to fund my blaze wizard bossing mule... So people who haven't gotten on the boss mule meta get fucked too... I'll just use event nodestone to power up my mules, you know the 50 nodes they give out per event. That'll surely help right. I'm sick to my stomach. This company is unbelievable, to announce this shit after I hit mvp red last night is utter disrespect.
    `);
  }
}