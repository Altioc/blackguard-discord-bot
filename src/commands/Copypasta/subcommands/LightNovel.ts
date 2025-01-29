import { lightNovelTitles } from "../../../constants/lightNovelTitles";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const LightNovel: BotSubcommand = {
    name: "lightnovel",

    serialize: (subcommand) => {
        return subcommand
            .setName(LightNovel.name)
            .setDescription("Random lightnovel title");
    },

    execute: async (interaction) => {
        const lightNovelTitle = lightNovelTitles[
            Math.floor(Math.random() * lightNovelTitles.length)
        ].title;
        await interaction.reply(lightNovelTitle);
    }
};
