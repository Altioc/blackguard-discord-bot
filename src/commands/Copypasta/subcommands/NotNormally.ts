import { BotSubcommand } from "../../../types/BotSubcommand";

export const NotNormally: BotSubcommand = {
    name: "notnormally",

    serialize: (subcommand) => {
        return subcommand
            .setName(NotNormally.name)
            .setDescription("skilled player but that is not normally...")
            .addStringOption(option => (
                option
                    .setName("name")
                    .setDescription("The name of skilled player.")
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const name = options.getString("name");

        interaction.reply(`
${name} skilled player but that is not normally, This very very insane..They need to check them pc and game..Maybe they not cheating but maybe they using the game deficit..and this cant seem on screen..
        `);
    }
};
