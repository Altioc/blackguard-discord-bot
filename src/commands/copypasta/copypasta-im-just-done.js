module.exports = {
  subCommandData: subcommand => (
    subcommand
      .setName('imjustdone')
      .setDescription('I\'m just done.')
  ),
    
  async execute(interaction) {  
    interaction.reply(`
      I'm just done. I'm not subjecting myself to any more Torture. I'm gonna a miss maplestory. And all the mememories I have, which totally sucks because I'm super nostalgic. Any ways bye 👋 happy mapleing guys good luck defeating the black mage without me! I'm gonna miss this game... - ${interaction.member} from ${interaction.guild.name}
      `);
  },
};
