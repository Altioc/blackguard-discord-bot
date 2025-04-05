import { EmbedBuilder } from "discord.js";
import assert from "node:assert";
import {
    BetOption,
    messages,
    messageTypeColors,
    responseCodes
} from "../../../constants";
import { Books } from "../../../controllers/Books";
import { Economy } from "../../../controllers/Economy";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Bet: BotSubcommand = {
    name: "bet",

    serialize: (subcommand) => {
        return subcommand
            .setName(Bet.name)
            .setDescription(
                "Places a bet on the current wager for a given option and amount."
            )
            .addIntegerOption(option => (
                option
                    .setName("value")
                    .setDescription("The amount of Bilaim to bet.")
                    .setRequired(true)
            ))
            .addStringOption(option => (
                option
                    .setName("option")
                    .setDescription("What outcome to place your bet on.")
                    .addChoices(
                        ...Object.keys(BetOption)
                            .map((key) => ({
                                name: key,
                                value: key
                            }))
                    )
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { user, options } = interaction;
        const value = options.getInteger("value");
        const option = options.getString("option");

        try {
            assert(value !== null);
            assert(option !== null);

            const { responseCode, value: finalBetAmount } = await Books.bet(
                user.id,
                value,
                option as BetOption
            );

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("New Bet")
                                .setColor(messageTypeColors.Success)
                                .setDescription("You have placed a bet")
                                .addFields(
                                    {
                                        name: "Value:",
                                        value:
                                            `${Economy.currencyEmoji} ${finalBetAmount}`
                                    },
                                    { name: "Option:", value: `"${option}"` }
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.doesntExist: {
                    await interaction.editReply(messages.authorNoWallet());
                    break;
                }
                case responseCodes.economy.insufficientFunds: {
                    await interaction.editReply(messages.insufficientFunds());
                    break;
                }
                case responseCodes.alreadyExists: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Existing Bet")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    "You have already placed a bet on this wager and you cannot modify it."
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.book.ownWager: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Invalid Bet")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    "You may not bet on your own wager."
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.book.noOpenWager: {
                    await interaction.editReply(
                        messages.wagerClosed(
                            "The wager is closed and is not accepting new bets."
                        )
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
            console.log(error, "Wager -> Bet.execute() -> Books.bet()");
            interaction.editReply(messages.unknownError());
        }
    }
};
