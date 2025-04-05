import { EmbedBuilder } from "discord.js";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { messageTypeColors } from "../../../constants";
import { BotSubcommand } from "../../../types/BotSubcommand";
import { EmotePackData } from "../../../types/EmotePackData";
import { emotePackPath } from "..";

export const Load: BotSubcommand = {
    name: "load",

    serialize: (subcommand) => {
        return subcommand
            .setName(Load.name)
            .setDescription("Loads the specified emote pack")
            .addStringOption(option => (
                option
                    .setName("pack")
                    .setDescription("Either the name of the pack or its number")
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options, guild } = interaction;
        const targetPackName = options.getString("pack");

        assert(targetPackName !== null);
        assert(guild !== null);

        await fs.access(emotePackPath, fs.constants.R_OK);

        const {
            packPath,
            packName,
            emoteFileNames
        } = await getEmotePackData(targetPackName);

        const existingEmotes = await guild.emojis.fetch();

        emoteFileNames.forEach(async (emoteFileName) => {
            const emoteName = emoteFileName.split(".")[0];

            const emoteAlreadyExists = existingEmotes.find((emote) => (
                emote.name === emoteName
            ));

            if (emoteAlreadyExists !== undefined) {
                await guild.emojis.delete(emoteAlreadyExists);
            }

            await guild.emojis.create({
                name: emoteName,
                attachment: path.join(packPath, emoteFileName)
            });
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Emote Pack Loaded")
                    .setColor(messageTypeColors.Success)
                    .setDescription(`Successfully loaded pack: ${packName}`)
            ]
        });
    }
};

const getEmotePackData = async (
    targetPackName: string
): Promise<EmotePackData> => {
    const packNames = await fs.readdir(emotePackPath);

    const packNameByDirName = packNames.find((packName) => (
        packName.toLowerCase().trim() === targetPackName.toLowerCase().trim()
    ));

    if (packNameByDirName !== undefined) {
        const packPath = path.join(emotePackPath, packNameByDirName);

        return {
            packPath,
            packName: packNameByDirName,
            emoteFileNames: await fs.readdir(packPath)
        };
    } else if (!isNaN(+targetPackName)) {
        const packNumber = +targetPackName - 1;
        const packName = packNames[packNumber];
        const packPath = path.join(emotePackPath, packName);

        return {
            packPath,
            packName,
            emoteFileNames: await fs.readdir(packPath)
        };
    }

    throw new Error(`Invalid pack name: ${targetPackName}`);
};
