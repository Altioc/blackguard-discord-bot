import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Economy } from "../../../controllers/Economy";

export const Send = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("send")
            .setDescription(
                "Sends a specified amount of your Bilaim to another user."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription(
                        "The user whose wallet to send the Bilaim to."
                    )
                    .setRequired(true)
            ))
            .addIntegerOption(option => (
                option
                    .setName("value")
                    .setDescription("The amount of your Bilaim to send.")
                    .setRequired(true)
            ))
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const { user, options, guild } = interaction;
        const value = options.getInteger("value");

        try {
            const targetUser = options.getUser("target");

            assert(targetUser !== null);
            assert(guild !== null);

            const target = await guild.members.fetch(targetUser.id);

            assert(value !== null);

            const { responseCode } = await Economy.transferCurrency(
                user.id,
                target.id,
                value
            );

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Bilaim Transfer")
                                .setColor(messageTypeColors.success)
                                .setDescription(
                                    `You have transfered ${Economy.currencyEmoji} ${value}.`
                                )
                                .addFields({
                                    name: "To:",
                                    value: target.displayName
                                })
                        ]
                    });
                    break;
                }
                case responseCodes.positiveValueNeeded: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Invalid Value")
                                .setColor(messageTypeColors.failure)
                                .setDescription(
                                    "You can only send Bilaim in values greater than 0."
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.economy.noFromUser: {
                    await interaction.editReply(messages.authorNoWallet());
                    break;
                }
                case responseCodes.economy.noToUser: {
                    await interaction.editReply(
                        messages.targetNoWallet(target.displayName)
                    );
                    break;
                }
                case responseCodes.economy.insufficientFunds: {
                    await interaction.editReply(messages.insufficientFunds());
                    break;
                }
                case responseCodes.economy.sameUser: {
                    await interaction.editReply(
                        messages.invalidTarget(
                            "You cannot send Bilaim to yourself."
                        )
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
                "Wallet -> Send.execute() -> Economy.transferCurrency()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
