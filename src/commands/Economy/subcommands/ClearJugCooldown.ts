import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import { messages, messageTypeColors, responseCodes } from "../../../constants";
import { Rpg } from "../../../controllers/Rpg";
import ids from "../../../ids.json";

export const ClearJugCooldown = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("clear-jug-cooldown")
            .setDescription(
                "Clears the jug cooldown for all users or a specific user."
            )
            .addUserOption(option => (
                option
                    .setName("target")
                    .setDescription(
                        "The user whose cooldown you want to clear."
                    )
            ))
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        const { options, guild, member } = interaction;
        const targetUserId = options.getUser("target")?.id;

        try {
            assert(guild !== null);

            let target;

            if (targetUserId) {
                target = await guild.members.fetch(targetUserId);
            }

            assert(member !== null);

            if (!ids.superUsers.includes(member.user.id)) {
                await interaction.editReply(messages.incorrectPermissions());
                return;
            }

            assert(targetUserId !== undefined);

            const { responseCode } = Rpg.clearJugCooldown(targetUserId);

            switch (responseCode) {
                case responseCodes.success: {
                    if (targetUserId) {
                        assert(target !== undefined);
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(
                                        `${target.displayName}'s jug cooldown has been cleared.`
                                    )
                                    .setColor(messageTypeColors.success)
                            ]
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(
                                        "All jug cooldowns have been cleared."
                                    )
                                    .setColor(messageTypeColors.success)
                            ]
                        });
                    }
                    break;
                }
                case responseCodes.userDoesNotExist: {
                    await interaction.editReply(
                        messages.invalidTarget(
                            "User's ability to jug is not on cooldown."
                        )
                    );
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(
                error,
                "Economy -> JugClearCooldown.execute() -> Rpg.clearJugCooldown()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};
