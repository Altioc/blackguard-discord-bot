import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import path from "node:path";
import { messages } from "../../constants";
import { AuthorOf } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { List } from "./subcommands/List";
import { Load } from "./subcommands/Load";

export const emotePackPath = path.join(
    __dirname,
    "@package/assets/emotePacks"
);

const EmotePack: BotCommand = {
    name: "emotepack",

    subcommands: new Map([
        [List.name, List],
        [Load.name, Load]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(EmotePack.name)
            .setDescription("Easily swap between sets of emotes.");

        EmotePack.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).has(PermissionFlagsBits.Administrator);
    },

    execute: async (interaction) => {
        const subcommandName = interaction.options.getSubcommand();

        const subcommand = EmotePack.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply(messages.unknownError());
        }
    }
};

export default EmotePack;
