import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder
} from "discord.js";
import assert from "node:assert";
import { messages } from "../../../constants";
import { Meta } from "../../../controllers/Meta";
import { deleteIntroductionAutomatorButton } from "../helpers";

export const Delete = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("delete")
            .setDescription("Deletes the introduction automator")
    ),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const { memberPermissions } = interaction;

        if (
            !memberPermissions
            || !memberPermissions.has(PermissionFlagsBits.Administrator)
        ) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

        assert(interaction.guild !== null);

        const buttonWasDeleted = await deleteIntroductionAutomatorButton(
            interaction.guild
        );

        await Meta.introductionAutomator.setChannelId(null);

        if (buttonWasDeleted) {
            interaction.editReply(`Introduction automator removed`);
        } else {
            interaction.editReply(
                `Could not find existing introduction automator`
            );
        }
    }
};
