import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import assert from "node:assert";
import {
    CurrencyLocation,
    messages,
    MessageTypeColor,
    responseCodes
} from "../../../constants";
import { Economy } from "../../../controllers/Economy";
import { AuthorOf } from "../../../models/ExecutePermission";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Deduct: BotSubcommand = {
    name: "deduct",

    serialize: (subcommand) => {
        return subcommand
            .setName(Deduct.name)
            .setDescription(
                "Deducts a specified amount of Bilaim from a user's wallet."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription(
                        "The user whose wallet to deduct the Bilaim from."
                    )
                    .setRequired(true)
            ))
            .addIntegerOption(option => (
                option
                    .setName("value")
                    .setDescription("The amount of Bilaim to deduct.")
                    .setRequired(true)
            ))
            .addBooleanOption(option => (
                option
                    .setName("bank")
                    .setDescription(
                        "Whether or not to add money to the users bank instead of their wallet. Defaults to false."
                    )
            ));
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).has(PermissionFlagsBits.Administrator);
    },

    execute: async (interaction) => {
        await interaction.deferReply();
        const { options, guild } = interaction;
        const value = options.getInteger("value");
        const toBank = options.getBoolean("bank");

        const addTarget = toBank
            ? CurrencyLocation.Bank
            : CurrencyLocation.Wallet;

        try {
            const targetUser = options.getUser("target");

            assert(targetUser !== null);
            assert(guild !== null);

            const target = await guild.members.fetch(targetUser.id);

            assert(value !== null);

            if (value <= 0) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Invalid Value")
                            .setColor(MessageTypeColor.Failure)
                            .setDescription(
                                "You can only deduct Bilaim in values greater than 0."
                            )
                    ]
                });
                return;
            }

            const { responseCode, value: newValue } = await Economy
                .modifyCurrency(target.id, -value, addTarget);

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Bilaim Deducted")
                                .setColor(MessageTypeColor.Success)
                                .setDescription(
                                    `${Economy.currencyEmoji} ${value} has been deducted.`
                                )
                                .addFields(
                                    {
                                        name: "From:",
                                        value: target.displayName
                                    },
                                    {
                                        name: "New balance:",
                                        value: `${newValue}`
                                    }
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.userDoesNotExist: {
                    await interaction.editReply(
                        messages.targetNoWallet(target.displayName)
                    );
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(
                error,
                "Wallet -> Deduct.execute() -> Economy.modifyCurrency()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
