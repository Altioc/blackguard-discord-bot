import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import { messages } from "../../constants";
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
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setContexts(InteractionContextType.Guild);

        Economy.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
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
