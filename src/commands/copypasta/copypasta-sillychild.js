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
    const weak_class = options.getString('weak_class');
    const strong_class = options.getString('strong_class');
    const class_rank = options.getNumber('class_rank');
    const class_diff = class_rank-1

    interaction.reply(`
Silly child, you've got a lot to learn in life. If you used modern technology you'll have access to something called Google. If you googled "class damage charts" you'll realize ${weak_class} is ranked ${class_rank}. Do you understand what that means? Probably not so allow me to use my knowledge of epsilon-delta and apply it to e=mc2 and boom I have come to the conclusion that there are ${class_diff} other classes infront of it. Lets take a moment and really take in what that means... theres ${class_diff} other mother fuckers stronger than you. Do you like that? Imagine having ${class_diff} mother fuckers smarter than you in your classroom. You like that? No? Make a ${strong_class} my son.
    `);
  }
}
