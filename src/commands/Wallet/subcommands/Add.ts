import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import {
    CurrencyLocation,
    messages,
    messageTypeColors,
    responseCodes
} from "../../../constants";
import { Economy } from "../../../controllers/Economy";

export const Add = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("add")
            .setDescription(
                "Adds a specified amount of Bilaim to the target's wallet."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription("The user whose wallet to add Bilaim to.")
                    .setRequired(true)
            ))
            .addIntegerOption(option => (
                option
                    .setName("value")
                    .setDescription("The amount of Bilaim to add.")
                    .setRequired(true)
            ))
            .addBooleanOption(option => (
                option
                    .setName("bank")
                    .setDescription(
                        "Whether or not to add money to the users bank instead of their wallet. Defaults to false."
                    )
            ))
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const { options, guild } = interaction;
        const value = options.getInteger("value");
        const toBank = options.getBoolean("bank");

        const addTarget = toBank
            ? CurrencyLocation.Bank
            : CurrencyLocation.Wallet;

        if (
            !interaction.memberPermissions
            || !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

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
                            .setColor(messageTypeColors.failure)
                            .setDescription(
                                "You can only add Bilaim in values greater than 0."
                            )
                    ]
                });
                return;
            }

            const { responseCode, value: newValue } = await Economy
                .modifyCurrency(target.id, value, addTarget);

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Bilaim Added")
                                .setColor(messageTypeColors.success)
                                .setDescription(
                                    `${Economy.currencyEmoji} ${value} has been added.`
                                )
                                .addFields(
                                    { name: "To:", value: target.displayName },
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
                "Wallet -> Add.execute() -> Economy.modifyCurrency()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
