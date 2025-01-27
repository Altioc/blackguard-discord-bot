import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Books } from "../../../controllers/Books";

export const Close = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("close")
            .setDescription("Closes an active wager to new bets.")
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        const { user } = interaction;

        if (Books.latestWager === null) {
            await interaction.editReply(messages.noActiveWager());
            return;
        }

        if (
            !interaction.memberPermissions
            || (!interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
                && user.id !== Books.latestWager.ownerId)
        ) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

        try {
            const { responseCode } = await Books.setWagerOpenState(false);

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Closed Wager")
                                .setColor(messageTypeColors.success)
                                .setDescription(
                                    "This wager can no longer accept bets."
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.book.setWagerOpenState.wrongState: {
                    await interaction.editReply(
                        messages.wagerClosed("This wager is already closed.")
                    );
                    break;
                }
                case responseCodes.book.noActiveWager: {
                    await interaction.editReply(messages.noActiveWager());
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(
                error,
                "Wager -> Close.execute() -> Books.setWagerOpenState()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
