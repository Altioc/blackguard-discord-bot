import { BotSubcommand } from "../../../types/BotSubcommand";

export const StrengthReward: BotSubcommand = {
    name: "strengthreward",

    serialize: (subcommand) => {
        return subcommand
            .setName(StrengthReward.name)
            .setDescription(
                "If your party is strong enough to kill the boss..."
            );
    },

    execute: async (interaction) => {
        interaction.reply(`
If your party is strong enough to kill the boss before you all die out then you still clear the boss. Likewise if you can survive long enough that the boss dies then you still clear the boss.

Easy clears are the reward you get for being strong ya know
        `);
    }
};
