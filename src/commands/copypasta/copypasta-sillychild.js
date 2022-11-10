module.exports = {
  subCommandData: (subcommand) => (
    subcommand
      .setName('sillychild')
      .setDescription('silly child, you\'ve got a lot to learn in life...')
      .addStringOption(option => (
        option
          .setName('weak-class')
          .setDescription('The name of the weak class.')
          .setRequired(true)
      ))
      .addStringOption( option => (
        option
          .setName('strong-class')
          .setDescription('The name of the strong class.')
          .setRequired(true)
      ))
      .addNumberOption( option => (
        option
          .setName('class-rank')
          .setDescription('The rank of the weak class on the dpm chart')
          .setRequired(true)
      ))
  ),
  
  async execute(interaction) {
    const { options } = interaction;
    const weakClass = options.getString('weak-class');
    const strongClass = options.getString('strong-class');
    const classRank = options.getNumber('class-rank');
    const classRankDiff = Math.max(0, classRank - 1);

    interaction.reply(`
Silly child, you've got a lot to learn in life. If you used modern technology you'll have access to something called Google. If you googled "class damage charts" you'll realize ${weakClass} is ranked ${classRank}. Do you understand what that means? Probably not so allow me to use my knowledge of epsilon-delta and apply it to e=mc2 and boom I have come to the conclusion that there are ${classRankDiff} other classes infront of it. Lets take a moment and really take in what that means... theres ${classRankDiff} other mother fuckers stronger than you. Do you like that? Imagine having ${classRankDiff} mother fuckers smarter than you in your classroom. You like that? No? Make a ${strongClass} my son.
    `);
  }
}
