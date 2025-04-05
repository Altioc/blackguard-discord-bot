import { EmbedBuilder } from "discord.js";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Economy } from "../../../controllers/Economy";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Read: BotSubcommand = {
    name: "read",

    serialize: (subcommand) => {
        return subcommand
            .setName(Read.name)
            .setDescription(
                "Prints out the contents of the target user's wallet or the author if no target is specified."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription(
                        "The user whose wallet to read or the author if omitted."
                    )
            ));
    },

    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const { user, options } = interaction;
        const target = options.getUser("target") || user;
        const { currencyEmoji } = Economy;

        try {
            const { responseCode, value: wallet } = await Economy
                .getWallet(target.id);

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Wallet")
                                .setColor(messageTypeColors.Success)
                                .setFields([
                                    {
                                        name: "Wallet",
                                        value:
                                            `${currencyEmoji} ${wallet.value}`,
                                        inline: true
                                    },
                                    {
                                        name: "Bank",
                                        value:
                                            `${currencyEmoji} ${wallet.bank}`,
                                        inline: true
                                    },
                                    { name: " ", value: " " },
                                    { name: " ", value: " " },
                                    {
                                        name: "Total",
                                        value: `${currencyEmoji} ${
                                            wallet.value + wallet.bank
                                        }`
                                    }
                                ])
                        ]
                    });
                    break;
                }
                case responseCodes.doesntExist: {
                    const walletOwnedByAuthor = target.id === user.id;
                    const pronoun = walletOwnedByAuthor ? "You" : "They";

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Doesn't Exist")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    `${pronoun} do not have a Bilaim wallet.`
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
                "Wallet -> Read.execute() -> Economy.getWallet()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
