import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import { messages, messageTypeColors } from "../../../constants";
import { Books } from "../../../controllers/Books";
import { AuthorOf } from "../../../models/ExecutePermission";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Reactivate: BotSubcommand = {
    name: "reactivate",

    serialize: (subcommand) => {
        return subcommand
            .setName(Reactivate.name)
            .setDescription("Reactivates an inactive wager.");
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).has(PermissionFlagsBits.Administrator);
    },

    execute: async (interaction) => {
        if (Books.latestWager && !Books.latestWager.isActive) {
            Books.latestWager.isActive = true;
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Reactivate Wager")
                        .setColor(messageTypeColors.success)
                        .setDescription("The latest wager was reactivated.")
                ]
            });
        } else {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("No Inactive Wager")
                        .setColor(messageTypeColors.failure)
                        .setDescription(
                            "There is no inactive wager to reactivate."
                        )
                ]
            });
        }
    }
};
