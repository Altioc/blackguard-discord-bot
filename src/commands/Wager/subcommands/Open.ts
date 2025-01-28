import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Books } from "../../../controllers/Books";
import { AuthorOf, Or } from "../../../models/ExecutePermission";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Open: BotSubcommand = {
    name: "open",

    serialize: (subcommand) => {
        return subcommand
            .setName(Open.name)
            .setDescription("Opens a closed active wager to new bets.");
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
