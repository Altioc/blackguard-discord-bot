import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { superUsers } from "../../ids.json";
import { AuthorOf } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";

const Test: BotCommand = {
    name: "test",

    subcommands: new Map(),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Test.name)
            .setDescription("This is a secret test command; shhh!");

        Test.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).is(superUsers);
    },

    execute: async (interaction) => {
        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Test.subcommands.get(subcommandName);

        interaction.reply({
            content: `${interaction.guild?.banner}`,
            ephemeral: true
        });

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply(messages.unknownError());
        }
    }
};

export default Test;
