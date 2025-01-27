import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { ClearJugCooldown } from "./subcommands/ClearJugCooldown";

const Economy: BotCommand = {
    data: new SlashCommandBuilder()
        .setName("economy")
        .setDescription(
            "Attempts to jug someone elses bilaims with a small chance for a counter jug on failure."
        )
        .addSubcommand(ClearJugCooldown.subCommandData),

    requiredRoles: ["Blackguard"],

    async execute(interaction) {
        await interaction.deferReply();
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "clear-jug-cooldown": {
                ClearJugCooldown.execute(interaction);
                break;
            }
            default: {
                await interaction.editReply(messages.unknownError());
            }
        }
    }
};

export default Economy;
