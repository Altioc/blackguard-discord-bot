import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { superUsers } from "../../ids.json";
import { AuthorOf } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { ClearJugCooldown } from "./subcommands/ClearJugCooldown";

const Economy: BotCommand = {
    name: "economy",

    subcommands: new Map([
        [ClearJugCooldown.name, ClearJugCooldown]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Economy.name)
            .setDescription(
                "Attempts to jug someone elses bilaims with a small chance for a counter jug on failure."
            );

        Economy.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).is(superUsers);
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Economy.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.editReply(messages.unknownError());
        }
    }
};

export default Economy;
