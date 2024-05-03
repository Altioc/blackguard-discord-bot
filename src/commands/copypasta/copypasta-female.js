module.exports = {
    subCommandData: (subcommand) => (
      subcommand
        .setName('female')
        .setDescription('Hello, I noticed you have a profile picture of a very beautiful (but also intelligent looking...')
        .addStringOption(option => (
          option
            .setName('class-name')
            .setDescription('The class of the message recipient')
        ))
    ),
    
    async execute(interaction) {
      const { options } = interaction;
      const className = options.getString('class-name') || 'blaster';
  
      await interaction.reply(`
Hello, I noticed you have a profile picture of a very beautiful (but also intelligent looking!) female, and I am under the presumption that this goddess is you? It is quite astonishing to see a female here in the Blackguard Guild. I am quite popular around here in this server, so if you require any guidance, please, throw me a mention. I will assist you at any hour, day, or night. And, before you are mistaken, I do not seek your hand in a romantic way; although, I am not opposed in the event you are interested in me, as many women often are. I am a man of standard, and I do not bow to just any female that comes my way, unlike my peers... So rest assured that I will not be in the way of your gaming and socializing experience. Consider me ur hero? .. a companion, a partner, and perhaps we can enjoy some video games together some time. I see you play Maplestory, and are you good at playing ${className}? I am a peak Mu Lung Dojo 52F, so I would be happy to help you level up. Platonically of course, unless you (like many others) change your mind on that. I look forward to our future together (as friends of course.)
      `);
    }
  }
