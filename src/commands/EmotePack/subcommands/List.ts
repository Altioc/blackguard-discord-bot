import { EmbedBuilder } from "discord.js";
import fs from "node:fs/promises";
import { messageTypeColors } from "../../../constants";
import { BotSubcommand } from "../../../types/BotSubcommand";
import { emotePackPath } from "..";

export const List: BotSubcommand = {
    name: "list",

    serialize: (subcommand) => {
        return subcommand
            .setName(List.name)
            .setDescription("List current emote packs");
    },

    execute: async (interaction) => {
        await fs.access(emotePackPath, fs.constants.R_OK);

        const packNames = await fs.readdir(emotePackPath);

        if (packNames.length === 0) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Emote Packs")
                        .setColor(messageTypeColors.Success)
                        .setDescription("No emote packs have been created yet.")
                ],
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Emote Packs")
                    .setColor(messageTypeColors.Success)
                    .setDescription(
                        packNames.map((packName) => (
                            `1. ${packName}`
                        )).join("\n")
                    )
            ],
            ephemeral: true
        });
    }
};
