import { BotSubcommand } from "../../../types/BotSubcommand";

export const BlessYourHeart: BotSubcommand = {
    name: "blessyourheart",

    serialize: (subcommand) => {
        return subcommand
            .setName(BlessYourHeart.name)
            .setDescription("Well bless your heart...")
            .addStringOption(option => (
                option
                    .setName("name")
                    .setDescription("The name player with a blessed heart.")
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const name = options.getString("name");

        interaction.reply(`
Well bless your heart ${name}, it's so nice to have a reasonable discussion where we agree to disagree on this discord
        `);
    }
};
