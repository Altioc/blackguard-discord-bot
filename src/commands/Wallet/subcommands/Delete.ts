import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Economy } from "../../../controllers/Economy";
import { AuthorOf } from "../../../models/ExecutePermission";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Delete: BotSubcommand = {
    name: "delete",

    serialize: (subcommand) => {
        return subcommand
            .setName(Delete.name)
            .setDescription("Deletes the target user's wallet.")
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription("The user whose wallet to delete.")
                    .setRequired(true)
            ));
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).has(PermissionFlagsBits.Administrator);
    },

    execute: async (interaction) => {
        await interaction.deferReply();
        const { user, options } = interaction;
        const target = options.getUser("target") || user;

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
                                .setColor(messageTypeColors.Success)
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
                                .setColor(messageTypeColors.Failure)
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
