import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { superUsers } from "../../ids.json";
import { AuthorOf } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { Get } from "./subcommands/Get";
import { Reset } from "./subcommands/Reset";
import { Set } from "./subcommands/Set";

const Doc: BotCommand = {
    name: "doc",

    subcommands: new Map([
        [Get.name, Get],
        [Reset.name, Reset],
        [Set.name, Set]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Doc.name)
            .setDescription("The base command for all things involving docs.");

        Doc.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).is(superUsers);
    },

    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true
        });

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Doc.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.editReply(messages.unknownError());
        }
    }
};

export default Doc;
