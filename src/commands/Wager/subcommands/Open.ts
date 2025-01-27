import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Books } from "../../../controllers/Books";

export const Open = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("open")
            .setDescription("Opens a closed active wager to new bets.")
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        const { user } = interaction;

        if (Books.latestWager === null) {
            await interaction.editReply(messages.noActiveWager());
            return;
        }

        if (
            !interaction.memberPermissions || (
                !interaction.memberPermissions.has(
                    PermissionFlagsBits.Administrator
                ) && user.id !== Books.latestWager.ownerId
            )
        ) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

        try {
            const { responseCode } = await Books.setWagerOpenState(true);

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Opened Wager")
                                .setColor(messageTypeColors.success)
                                .setDescription(
                                    "This wager can now accept new bets."
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.book.setWagerOpenState.wrongState: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Already Open")
                                .setColor(messageTypeColors.failure)
                                .setDescription("This wager is already open.")
                        ]
                    });
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
                "Wager -> Open.execute() -> Books.setWagerOpenState()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
