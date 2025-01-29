import { ChannelType, TextChannel } from "discord.js";
import assert from "node:assert";
import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";
import {
    createIntroductionAutomatorButton,
    deleteIntroductionAutomatorButton
} from "../helpers";

export const Create: BotSubcommand = {
    name: "create",

    serialize: (subcommand) => {
        return subcommand
            .setName(Create.name)
            .setDescription("Creates an introduction automator")
            .addChannelOption(option =>
                (
                    option
                        .setName("channel")
                        .setDescription("The channel to put the button in.")
                        .addChannelTypes(ChannelType.GuildText)
                )
                    .setRequired(true)
            );
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const channel = options.getChannel("channel");

        assert(interaction.guild !== null);

        await deleteIntroductionAutomatorButton(interaction.guild);

        assert(channel instanceof TextChannel);

        await createIntroductionAutomatorButton(channel);

        await Meta.introductionAutomator.setChannelId(channel.id);

        interaction.editReply(`Introduction automator added to ${channel}`);
    }
};
