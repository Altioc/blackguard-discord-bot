import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from "discord.js";
import { lightNovelTitles } from "../../../constants/lightNovelTitles";

export const LightNovel = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand
            .setName("lightnovel")
            .setDescription("Random lightnovel title"),

    async execute(interaction: ChatInputCommandInteraction) {
        const lightNovelTitle = lightNovelTitles[
            Math.floor(Math.random() * lightNovelTitles.length)
        ].title;
        await interaction.reply(lightNovelTitle);
    }
};
