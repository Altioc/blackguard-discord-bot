import { Collection, EmbedBuilder, Guild, GuildEmoji } from "discord.js";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { messageTypeColors } from "../../../constants";
import { Meta } from "../../../controllers/Meta";
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

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Emote Pack Loading Started")
                    .setDescription(`Pack: ${packName}`)
            ]
        });

        Meta.logInfo(`Loading emote files: ${emoteFileNames.join(", ")}`);
        for (const emoteFileName of emoteFileNames) {
            await replaceEmote(packPath, emoteFileName, guild, existingEmotes);
        }

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Emote Pack Loading Finished")
                    .setColor(messageTypeColors.Success)
                    .setDescription(`Pack: ${packName}`)
            ]
        });
    }
};

const replaceEmote = async (
    packPath: string,
    emoteFileName: string,
    guild: Guild,
    existingEmotes: Collection<string, GuildEmoji>
): Promise<void> => {
    try {
        const emoteName = emoteFileName.split(".")[0];
        Meta.logInfo(`Loading emote: ${emoteName} at "${emoteFileName}"`);

        const emoteAlreadyExists = existingEmotes.find((emote) => (
            emote.name === emoteName
        ));

        if (emoteAlreadyExists !== undefined) {
            Meta.logInfo(`Removing old ${emoteName}`);
            await guild.emojis.delete(emoteAlreadyExists);
        }

        Meta.logInfo(`Adding new ${emoteName}`);
        await guild.emojis.create({
            name: emoteName,
            attachment: path.join(packPath, emoteFileName)
        });
    } catch (error) {
        Meta.logDebug(`${error}`);
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
