import { BotSubcommand } from "../../../types/BotSubcommand";

export const OakBa: BotSubcommand = {
    name: "oakba",

    serialize: (subcommand) => {
        return subcommand
            .setName(OakBa.name)
            .setDescription("BA should be done on high defense dummy...");
    },

    execute: async (interaction) => {
        interaction.reply(`
because the BA should be done on high defense dummy as every boss past normal pink bean has element resistance and every boss worth using BA as a reference has 300% pdr. By using low defense you ignore most of the effects of your IED and inner ability trait. And you skew the value of the number in the BA with the actual fight.
        `);
    }
};
