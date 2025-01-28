import { BotSubcommand } from "../../../types/BotSubcommand";

export const WhoDoYouKnow: BotSubcommand = {
    name: "whodoyouknow",

    serialize: (subcommand) => {
        return subcommand
            .setName(WhoDoYouKnow.name)
            .setDescription(
                "i think the entire idea of a boycott is a joke and you children..."
            );
    },

    execute: async (interaction) => {
        interaction.reply(`
i think the entire idea of a boycott is a joke and you children should be ashamed of your temper tantrum. please keep your negativity out of my mushroom game, ty. Who the hell do you people know.
        `);
    }
};
