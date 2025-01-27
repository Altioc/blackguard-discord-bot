import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import { messages, messageTypeColors } from "../../../constants";
import { Books } from "../../../controllers/Books";

export const Reactivate = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("reactivate")
            .setDescription("Reactivates an inactive wager.")
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        if (
            !interaction.memberPermissions
            || !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

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
