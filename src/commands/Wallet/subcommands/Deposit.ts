import { EmbedBuilder } from "discord.js";
import assert from "node:assert";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Economy } from "../../../controllers/Economy";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Deposit: BotSubcommand = {
    name: "deposit",

    serialize: (subcommand) => {
        return subcommand
            .setName(Deposit.name)
            .setDescription(
                "Deposits a specified amount of Bilaim to your bank."
            )
            .addStringOption(option => (
                option
                    .setName("amount")
                    .setDescription(
                        "The amount of Bilaim to deposit or \"max\" for the max you're allowed to deposit."
                    )
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const { user, options } = interaction;
        const amount = options.getString("amount");
        const { currencyEmoji } = Economy;

        try {
            assert(amount !== null);

            const { responseCode, value: responseValue } = await Economy
                .depositCurrency(user.id, amount);
            const { storableValueRatio } = Economy.bank;

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Bilaim Deposit")
                                .setColor(messageTypeColors.Success)
                                .setDescription(
                                    `You have deposited ${currencyEmoji} ${responseValue}.`
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.invalidInput: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Invalid Deposit Amount")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    `The provided deposit amount: ${responseValue} is not a postive integer or the word "max".`
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.positiveValueNeeded: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Invalid Amount")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    "You can only deposit Bilaim in amounts greater than 0."
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
                case responseCodes.valueTooHigh: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Deposit Amount Too High")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    `You cannot deposit more than ${currencyEmoji} ${responseValue}. The current bank deposit ratio is: ${storableValueRatio}`
                                )
                        ]
                    });
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(
                error,
                "Wallet -> Deposit.execute() -> Economy.depositCurrency()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
