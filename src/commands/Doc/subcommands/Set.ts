import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import {
    BlackguardDbDocName,
    messages,
    messageTypeColors,
    responseCodes
} from "../../../constants";
import { Docs } from "../../../controllers/Docs";

export const Set = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("set")
            .setDescription(
                "Saves the provided json object to the specified doc."
            )
            .addStringOption(option => (
                option
                    .setName("name")
                    .setDescription("The name of the doc to save to.")
                    .addChoices(
                        ...Object.entries(BlackguardDbDocName)
                            .map(([key, value]) => ({
                                name: value,
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
            ))
    ),

    async execute(interaction: ChatInputCommandInteraction) {
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
                        .setColor(messageTypeColors.success)
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
                                .setColor(messageTypeColors.success)
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
