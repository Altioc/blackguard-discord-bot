import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Books } from "../../../controllers/Books";

export const Start = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("start")
            .setDescription("Starts a new wager with the given premise.")
            .addStringOption(option => (
                option
                    .setName("premise")
                    .setDescription("The premise of the wager.")
                    .setRequired(true)
            ))
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        const { user, options } = interaction;
        const premise = options.getString("premise");

        try {
            assert(premise !== null);

            const { responseCode } = await Books.startWager(
                user.id,
                premise
            );

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("New Wager")
                                .setColor(messageTypeColors.success)
                                .setDescription("A new wager has been created")
                                .addFields({
                                    name: "Premise:",
                                    value: `"${premise}".`
                                })
                        ]
                    });
                    break;
                }
                case responseCodes.book.activeWagerAlreadyExists: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Already Exists")
                                .setColor(messageTypeColors.failure)
                                .setDescription(
                                    "There is already an active wager running. Please end that one before starting a new one."
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
                "Wager -> Start.execute() -> Books.startWager()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
