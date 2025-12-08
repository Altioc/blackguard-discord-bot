import { EmbedBuilder } from "discord.js";
import assert from "node:assert";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Economy } from "../../../controllers/Economy";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Create: BotSubcommand = {
    name: "create",

    serialize: (subcommand) => {
        return subcommand
            .setName(Create.name)
            .setDescription(
                "Creates a new wallet for the target user."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription("The user to create a wallet for")
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        await interaction.deferReply();
        const { options } = interaction;
        const target = options.getUser("target");

        try {
            assert(target);
            const { responseCode } = await Economy.createWallet(target.id);

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Create Wallet")
                                .setColor(messageTypeColors.Success)
                                .setDescription(
                                    "Their Bilaim wallet has been created."
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
                                    "They already have a Bilaim wallet."
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
