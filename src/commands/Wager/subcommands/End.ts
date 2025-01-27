import {
    bold,
    ChatInputCommandInteraction,
    codeBlock,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import {
    messages,
    messageTypeColors,
    responseCodes,
    WagerEndOptions
} from "../../../constants";
import { Books } from "../../../controllers/Books";
import { Response } from "../../../types/Response";
import { WagerResult } from "../../../types/WagerResult";

export const End = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("end")
            .setDescription(
                "Ends the current wager and distributes the payments."
            )
            .addStringOption(option => (
                option
                    .setName("outcome")
                    .setDescription("The outcome of the wager.")
                    .setRequired(true)
                    .addChoices(
                        ...Object.entries(WagerEndOptions)
                            .map(([key, value]) => ({
                                name: value,
                                value: key
                            }))
                    )
            ))
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        const { guild, options, user } = interaction;
        const outcome = options.getString("outcome");

        if (Books.latestWager === null) {
            await interaction.editReply(messages.noActiveWager());
            return;
        }

        if (
            !interaction.memberPermissions || (
                !interaction.memberPermissions.has(
                    PermissionFlagsBits.Administrator
                ) && user.id !== Books.latestWager.ownerId
            )
        ) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

        try {
            assert(outcome !== null);

            const { responseCode } = await Books.endWager();

            switch (responseCode) {
                case responseCodes.success: {
                    const { premise } = Books.latestWager;
                    const outcomeIsNeither =
                        outcome === WagerEndOptions.Neither;
                    const message = new EmbedBuilder()
                        .setTitle("End Wager")
                        .setColor(messageTypeColors.success)
                        .setDescription(`The ${premise} wager has ended.`)
                        .addFields({ name: "outcome:", value: `"${outcome}"` });

                    if (outcomeIsNeither) {
                        message.addFields({
                            name: "Returning bets",
                            value: "..."
                        });
                    } else {
                        message.addFields({
                            name: "Distributing payout",
                            value: "..."
                        });
                    }

                    await interaction.editReply({
                        embeds: [message]
                    });

                    let outcomeResponse: Response<WagerResult>;
                    if (outcomeIsNeither) {
                        outcomeResponse = await Books.rollBackBets();
                    } else {
                        outcomeResponse = await Books.distributePayout(
                            outcome
                        );
                    }

                    const {
                        responseCode: outcomeResponseCode,
                        value: results
                    } = outcomeResponse;

                    switch (outcomeResponseCode) {
                        case responseCodes.success: {
                            try {
                                assert(guild !== null);

                                const members = await Promise.all([
                                    ...results.winners.map(result =>
                                        guild.members.fetch(result.userId)
                                    ),
                                    ...results.losers.map(result =>
                                        guild.members.fetch(result.userId)
                                    )
                                ]);

                                const totalPlayers = [
                                    ...results.winners,
                                    ...results.losers
                                ];

                                const resultsAsFormattedString = totalPlayers
                                    .map((result, i) => {
                                        return `${result.net} ${
                                            members[i].displayName
                                        }\n`;
                                    }).join("");

                                await interaction.followUp(
                                    messages.wagerResults(
                                        `${bold("Results:")}${
                                            codeBlock(
                                                "diff",
                                                resultsAsFormattedString
                                            )
                                        }`
                                    )
                                );
                            } catch (error) {
                                console.log(
                                    error,
                                    "Wager -> End.execute() -> guild.members.fetch()"
                                );
                                interaction.followUp(messages.unknownError());
                            }

                            break;
                        }
                        case responseCodes.book.rollback.noParticipants: {
                            await interaction.followUp(
                                messages.wagerResults("There were no bets.")
                            );
                            break;
                        }
                        case responseCodes.book.distributePayout.noWinners: {
                            await interaction.followUp(
                                messages.wagerResults("There were no winners.")
                            );
                            break;
                        }
                        default: {
                            interaction.followUp(messages.unknownError());
                        }
                    }

                    break;
                }
                case responseCodes.book.noActiveWager: {
                    await interaction.editReply(messages.noActiveWager());
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(
                error,
                "Wager -> End.execute() -> Books.endWager()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
