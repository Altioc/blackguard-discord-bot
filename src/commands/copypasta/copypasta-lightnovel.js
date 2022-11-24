const lightnovels = require('../../constants/lightnovel-titles')

module.exports = {
  subCommandData: (subcommand) =>
    subcommand
    .setName('lightnovel')
    .setDescription('Random lightnovel title'),

  async execute(interaction) {
    await interaction.reply(
      getRandomLightnovelTitle(lightnovels)
    );
  },
};

const getRandomLightnovelTitle = (lightnovels) => {
  return lightnovels[Math.floor(Math.random()*lightnovels.length)].title;
}
