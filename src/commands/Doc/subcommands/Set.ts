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

export const Set: BotSubcommand = {
    name: "set",

    serialize: (subcommand) => {
        return subcommand
            .setName(Set.name)
            .setDescription(
                "Saves the provided json object to the specified doc."
            )
            .addStringOption(option => (
                option
                    .setName("name")
                    .setDescription("The name of the doc to save to.")
                    .addChoices(
                        ...Object.keys(BlackguardDbDocName)
                            .map((key) => ({
                                name: key,
                                value: key
                            }))
                    )
                    .setRequired(true)
            ))
            .addStringOption(option => (
                option
                    .setName("value")
                    .setDescription("The new json to save.")
                    .setRequired(true)
            ))
            .addBooleanOption(option => (
                option
                    .setName("config-only")
                    .setDescription(
                        "Whether or not to set just the config or the whole doc object. Defaults to: false"
                    )
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const docNameKey = options.getString("name");
        const value = options.getString("value");
        const configOnly = !!options.getBoolean("config-only");

        let valueAsJson;

        try {
            assert(value !== null);
            valueAsJson = JSON.parse(value.replace(/\n| /g, ""));
        } catch {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Invalid JSON")
                        .setColor(MessageTypeColor.Success)
                        .setDescription(
                            "You must provide a valid JSON when using the set command."
                        )
                ]
            });
            return;
        }

        try {
            assert(docNameKey !== null);
            assert(docNameKey in BlackguardDbDocName);

            const { responseCode } = await Docs.setDoc(
                docNameKey as keyof typeof BlackguardDbDocName,
                valueAsJson,
                configOnly
            );

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Doc Updated")
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
            console.log(error, "Doc -> Set.execute() -> Docs.setDoc()");
            interaction.editReply(messages.unknownError());
        }
    }
};
