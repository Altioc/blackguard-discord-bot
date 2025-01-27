import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Economy } from "../../../controllers/Economy";

export const Delete = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("delete")
            .setDescription("Deletes the target user's wallet.")
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription("The user whose wallet to delete.")
                    .setRequired(true)
            ))
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const { user, options } = interaction;
        const target = options.getUser("target") || user;

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
            const { responseCode } = await Economy.deleteWallet(target.id);
            const walletOwnedByAuthor = target.id === user.id;
            const pronoun = walletOwnedByAuthor ? "You" : "They";
            const possessivePronoun = walletOwnedByAuthor ? "Your" : "Their";

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Delete Wallet")
                                .setColor(messageTypeColors.success)
                                .setDescription(
                                    `${possessivePronoun} Bilaim wallet has been deleted.`
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.doesntExist: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Doesn't Exist")
                                .setColor(messageTypeColors.failure)
                                .setDescription(
                                    `${pronoun} don't have a Bilaim wallet.`
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
                "Wallet -> Delete.execute() -> Economy.deleteWallet()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
