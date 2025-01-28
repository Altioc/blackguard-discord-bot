import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Books } from "../../../controllers/Books";
import { AuthorOf, Or } from "../../../models/ExecutePermission";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Close: BotSubcommand = {
    name: "close",

    serialize: (subcommand) => {
        return subcommand
            .setName(Close.name)
            .setDescription("Closes an active wager to new bets.");
    },

    canExecute: async (interaction) => {
        if (Books.latestWager === null) {
            return true;
        }

        return Or(
            AuthorOf(interaction).has(PermissionFlagsBits.Administrator),
            AuthorOf(interaction).is(Books.latestWager.ownerId)
        );
    },

    execute: async (interaction) => {
        if (Books.latestWager === null) {
            await interaction.editReply(messages.noActiveWager());
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
