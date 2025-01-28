import assert from "node:assert";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const ImJustDone: BotSubcommand = {
    name: "imjustdone",

    serialize: (subcommand) => {
        return subcommand
            .setName(ImJustDone.name)
            .setDescription("I'm just done.");
    },

    execute: async (interaction) => {
        assert(interaction.guild !== null);

        interaction.reply(`
I'm just done. I'm not subjecting myself to any more Torture. I'm gonna a miss maplestory. And all the mememories I have, which totally sucks because I'm super nostalgic. Any ways bye 👋 happy mapleing guys good luck defeating the black mage without me! I'm gonna miss this game... - ${interaction.member} from ${interaction.guild.name}
        `);
    }
};
