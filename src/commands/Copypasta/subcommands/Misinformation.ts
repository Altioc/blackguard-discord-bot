import { BotSubcommand } from "../../../types/BotSubcommand";

export const Misinformation: BotSubcommand = {
    name: "misinformation",

    serialize: (subcommand) => {
        return subcommand
            .setName(Misinformation.name)
            .setDescription(
                "Please stop using the forums to spread misinformation..."
            );
    },

    execute: async (interaction) => {
        interaction.reply(`
Please stop using the forums to spread misinformation. Thank you. Just based on your comments you seem to enjoy engaging in arguing with others even when you are in the wrong. So I'll stop here.
        `);
    }
};
