import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Economy } from "../../../controllers/Economy";
import { And, AuthorOf, Or } from "../../../models/ExecutePermission";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Create: BotSubcommand = {
    name: "create",

    serialize: (subcommand) => {
        return subcommand
            .setName(Create.name)
            .setDescription(
                "Creates a new wallet for the target user or the author if no target specified."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription("The user or the author if ommitted.")
            ));
    },

    canExecute: async (interaction) => {
        const { options, user } = interaction;
        const target = options.getUser("target") || user;

        return Or(
            AuthorOf(interaction).is(target.id),
            And(
                AuthorOf(interaction).has(PermissionFlagsBits.Administrator),
                AuthorOf(interaction).isnt(target.id)
            )
        );
    },

    execute: async (interaction) => {
        await interaction.deferReply();
        const { user, options } = interaction;
        const target = options.getUser("target") || user;

        try {
            const { responseCode } = await Economy.createWallet(target.id);

            const walletOwnedByUser = target.id === user.id;
            const pronoun = walletOwnedByUser ? "You" : "They";
            const possessivePronoun = walletOwnedByUser ? "Your" : "Their";

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Create Wallet")
                                .setColor(messageTypeColors.Success)
                                .setDescription(
                                    `${possessivePronoun} Bilaim wallet has been created.`
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.alreadyExists: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Already Exists")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    `${pronoun} already have a Bilaim wallet.`
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
                "Wallet -> Create.execute() -> Economy.createWallet()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
