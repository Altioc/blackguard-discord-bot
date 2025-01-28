import { EmbedBuilder } from "discord.js";
import assert from "node:assert";
import {
    BlackguardDbDocName,
    messages,
    messageTypeColors,
    responseCodes
} from "../../../constants";
import { Docs } from "../../../controllers/Docs";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const Get: BotSubcommand = {
    name: "get",

    serialize: (subcommand) => {
        return subcommand
            .setName(Get.name)
            .setDescription(
                "Saves the provided json object to the specified doc."
            )
            .addStringOption(option => (
                option
                    .setName("name")
                    .setDescription("The name of the doc to get.")
                    .addChoices(
                        ...Object.entries(BlackguardDbDocName)
                            .map(([key, value]) => ({
                                name: value,
                                value: key
                            }))
                    )
                    .setRequired(true)
            ))
            .addBooleanOption(option => (
                option
                    .setName("config-only")
                    .setDescription(
                        "Whether or not to get just the config or the whole doc object. Defaults to: false"
                    )
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const docNameKey = options.getString("name");
        const configOnly = !!options.getBoolean("config-only");

        try {
            assert(docNameKey !== null);
            assert(docNameKey in BlackguardDbDocName);

            const { responseCode, value } = await Docs.getDoc(
                docNameKey as keyof typeof BlackguardDbDocName,
                configOnly
            );

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Doc Results")
                                .setColor(messageTypeColors.success)
                                .setDescription(value)
                        ]
                    });
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(error, "Doc -> Get.execute() -> Docs.getDoc()");
            interaction.editReply(messages.unknownError());
        }
    }
};
