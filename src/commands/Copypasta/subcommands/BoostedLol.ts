import { BotSubcommand } from "../../../types/BotSubcommand";

export const BoostedLol: BotSubcommand = {
    name: "boostedlol",

    serialize: (subcommand) => {
        return subcommand
            .setName(BoostedLol.name)
            .setDescription("you were boosted lol");
    },

    execute: async (interaction) => {
        await interaction.reply(`
you were boosted lol. there is no way to get 5 set abso in 30 days. even if u get max drop from damien and lotus u only get 2 coins per week. and 5 set takes 13. also a guardian angel ring? thats from slime
        `);
    }
};
