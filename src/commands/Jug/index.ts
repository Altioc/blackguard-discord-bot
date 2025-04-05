import { EmbedBuilder, SlashCommandBuilder, time } from "discord.js";
import assert from "node:assert";
import { messages, messageTypeColors, responseCodes } from "../../constants";
import { Economy } from "../../controllers/Economy";
import { Rpg } from "../../controllers/Rpg";
import { AuthorOf, Or } from "../../models/ExecutePermission";
import { BotCommandWithoutSubcommands } from "../../types/WithoutSubcommands";

const Jug: BotCommandWithoutSubcommands = {
    name: "jug",

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Jug.name)
            .setDescription(
                "Attempts to jug someone elses bilaims with a small chance for a counter jug on failure."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription("The user to attempt to jug.")
            ))
            .addStringOption(option => (
                option
                    .setName("value")
                    .setDescription(
                        "The amount to wager on the jug or \"all\" if you want to use all available funds as your jug wager."
                    )
            ));

        return serialization;
    },

    canExecute: async (interaction) => {
        return Or(
            AuthorOf(interaction).has("blackguard"),
            AuthorOf(interaction).has("guest")
        );
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        const { user, options, guild } = interaction;
        const targetUserId = options.getUser("target")?.id;

        try {
            assert(guild !== null);

            let target = null;
            if (targetUserId) {
                target = await guild.members.fetch(targetUserId);
            }

            const value = options.getString("value");

            const targetId = target === null ? null : target.id;
            const { currencyEmoji } = Economy;

            assert(value !== null);

            const { responseCode, value: responseValue } = await Rpg
                .jug(user.id, targetId, value);
            let initialWagerDisplay = "";

            if (value) {
                initialWagerDisplay = `wagered ${currencyEmoji} ${value} and `;
            }

            switch (responseCode) {
                case responseCodes.success: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Success")
                                .setColor(messageTypeColors.Success)
                                .setDescription(
                                    `You ${initialWagerDisplay}have sucessfully jugged ${currencyEmoji} ${responseValue.finalJugAmount} from ${
                                        target?.displayName ?? "monsters"
                                    }.`
                                )
                                .setFields([
                                    {
                                        name: "Cooldown",
                                        value: time(
                                            new Date(
                                                responseValue.cooldownEndTime
                                            ),
                                            "R"
                                        )
                                    }
                                ])
                        ]
                    });
                    break;
                }
                case responseCodes.invalidInput: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Invalid Jug Value")
                                .setColor(messageTypeColors.Failure)
                                .setDescription(
                                    `The provided jug value: ${value} is not a postive integer or the word "all".`
                                )
                        ]
                    });
                    break;
                }
                case responseCodes.economy.jug.counterSuccess: {
                    assert(target !== null);
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Counter")
                                .setColor(messageTypeColors.Success)
                                .setDescription(
                                    `You ${initialWagerDisplay}tried to jug ${target.displayName} but instead you got jugged for ${currencyEmoji} ${responseValue.finalJugAmount}.`
                                )
                                .setFields([
                                    {
                                        name: "Cooldown",
                                        value: time(
                                            new Date(
                                                responseValue.cooldownEndTime
                                            ),
                                            "R"
                                        )
                                    }
                                ])
                        ]
                    });
                    break;
                }
                case responseCodes.failure: {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Failure")
                                .setColor(messageTypeColors.Success)
                                .setDescription(
                                    `You ${initialWagerDisplay}failed to jug ${
                                        target?.displayName ?? "monsters"
                                    }.`
                                )
                                .setFields([
                                    {
                                        name: "Cooldown",
                                        value: time(
                                            new Date(responseValue),
                                            "R"
                                        )
                                    }
                                ])
                        ]
                    });
                    break;
                }
                case responseCodes.onCooldown: {
                    const offCooldownTime = responseValue;
                    await interaction.editReply(
                        messages.onCooldown(
                            time(new Date(offCooldownTime), "R")
                        )
                    );
                    break;
                }
                case responseCodes.economy.noFromUser: {
                    await interaction.editReply(messages.authorNoWallet());
                    break;
                }
                case responseCodes.economy.noToUser: {
                    assert(target !== null);
                    await interaction.editReply(
                        messages.targetNoWallet(target.displayName)
                    );
                    break;
                }
                case responseCodes.economy.sameUser: {
                    await interaction.editReply(
                        messages.invalidTarget("You cannot jug yourself.")
                    );
                    break;
                }
                case responseCodes.economy.insufficientFunds: {
                    await interaction.editReply(messages.insufficientFunds());
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(error, "Jug.execute() -> Rpg.jug()");
            interaction.editReply(messages.unknownError());
        }
    }
};

export default Jug;
