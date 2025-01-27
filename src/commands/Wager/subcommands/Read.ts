import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import { messages, messageTypeColors } from "../../../constants";
import { Books } from "../../../controllers/Books";
import { Economy } from "../../../controllers/Economy";

export const Read = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("read")
            .setDescription("Prints out the currently active wager.")
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        const { user, guild } = interaction;

        if (Books.latestWager === null || !Books.latestWager.isActive) {
            await interaction.editReply(messages.noActiveWager());
            return;
        }

        try {
            assert(guild !== null);

            const ownerUser = await guild.members.fetch(
                Books.latestWager.ownerId
            );
            const authorsBet = Books.latestWager.bets.find(bet =>
                bet.ownerId === user.id
            );

            const message = new EmbedBuilder()
                .setTitle("Current Wager")
                .setColor(messageTypeColors.success)
                .setDescription(
                    `The active wager is: "${Books.latestWager.premise}"`
                )
                .addFields({
                    name: "Owned by:",
                    value: `"${ownerUser.displayName}"`
                });

            if (authorsBet) {
                message.addFields({
                    name: "You have bet:",
                    value:
                        `${Economy.currencyEmoji} ${authorsBet.value} on "${authorsBet.option}".`
                });
            }

            message.addFields({
                name: "Status:",
                value: ["Closed", "Open"][+Books.latestWager.isOpen]
            });

            await interaction.editReply({
                embeds: [message]
            });
        } catch (error) {
            console.log(
                error,
                "Wager -> Read.execute() -> guild.members.fetch()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
