import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { messageTypeColors } from "../../../constants";
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
                        .setColor(messageTypeColors.Success)
                        .setDescription("The latest wager was reactivated.")
                ]
            });
        } else {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("No Inactive Wager")
                        .setColor(messageTypeColors.Failure)
                        .setDescription(
                            "There is no inactive wager to reactivate."
                        )
                ]
            });
        }
    }
};
