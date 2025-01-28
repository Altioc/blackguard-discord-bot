import { BotSubcommand } from "../../../types/BotSubcommand";

export const Misplay: BotSubcommand = {
    name: "misplay",

    serialize: (subcommand) => {
        return subcommand
            .setName(Misplay.name)
            .setDescription("some people might think it's a misplay...");
    },

    execute: async (interaction) => {
        interaction.reply(`
some people might think it's a misplay. since it was intentional, you lined it up and demonstrated high level of game mechanics/physics. you make this play not because you have to, it's because you can
        `);
    }
};
