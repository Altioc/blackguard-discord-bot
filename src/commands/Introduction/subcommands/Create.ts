import {
    ChannelType,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder,
    TextChannel
} from "discord.js";
import assert from "node:assert";
import { messages } from "../../../constants";
import { Meta } from "../../../controllers/Meta";
import {
    createIntroductionAutomatorButton,
    deleteIntroductionAutomatorButton
} from "../helpers";

export const Create = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("create")
            .setDescription("Creates an introduction automator")
            .addChannelOption(option =>
                (
                    option
                        .setName("channel")
                        .setDescription("The channel to put the button in.")
                        .addChannelTypes(ChannelType.GuildText)
                )
                    .setRequired(true)
            )
    ),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const { memberPermissions, options } = interaction;
        const channel = options.getChannel("channel");

        if (
            !memberPermissions
            || !memberPermissions.has(PermissionFlagsBits.Administrator)
        ) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

        assert(interaction.guild !== null);

        await deleteIntroductionAutomatorButton(interaction.guild);

        assert(channel instanceof TextChannel);

        await createIntroductionAutomatorButton(channel);

        await Meta.introductionAutomator.setChannelId(channel.id);

        interaction.editReply(`Introduction automator added to ${channel}`);
    }
};
