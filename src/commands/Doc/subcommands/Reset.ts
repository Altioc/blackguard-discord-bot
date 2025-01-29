import { EmbedBuilder } from "discord.js";
import assert from "node:assert";
import {
    BlackguardDbDocName,
    messages,
    MessageTypeColor,
    responseCodes
} from "../../../constants";
import { Docs } from "../../../controllers/Docs";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Reset: BotSubcommand = {
    name: "reset",

    serialize: (subcommand) => {
        return subcommand
            .setName(Reset.name)
            .setDescription("Resets the specified doc to its default value.")
            .addStringOption(option => (
                option
                    .setName("name")
                    .setDescription("The name of the doc to reset.")
                    .addChoices(
                        ...Object.keys(BlackguardDbDocName)
                            .map((key) => ({
                                name: key,
                                value: key
                            }))
                    )
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const docNameKey = options.getString("name");

        try {
            assert(docNameKey !== null);
            assert(docNameKey in BlackguardDbDocName);

            const { responseCode } = await Docs.resetDoc(
                docNameKey as keyof typeof BlackguardDbDocName
            );

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Doc Reset")
                                .setColor(MessageTypeColor.Success)
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
                "Doc -> Reset.execute() -> Docs.resetDoc()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
