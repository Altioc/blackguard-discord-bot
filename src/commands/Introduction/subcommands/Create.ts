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
                        .setName("introduction-channel")
                        .setDescription(
                            "The channel to put the introduction button in."
                        )
                        .addChannelTypes(ChannelType.GuildText)
                )
                    .setRequired(true)
            )
            .addChannelOption(option =>
                (
                    option
                        .setName("screening-channel")
                        .setDescription(
                            "The channel to put the screening buttons in."
                        )
                        .addChannelTypes(ChannelType.GuildText)
                )
                    .setRequired(true)
            );
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const introductionChannel = options.getChannel("introduction-channel");
        const screeningChannel = options.getChannel("screening-channel");

        assert(interaction.guild !== null);

        await deleteIntroductionAutomatorButton(interaction.guild);

        assert(introductionChannel instanceof TextChannel);
        assert(screeningChannel instanceof TextChannel);

        await createIntroductionAutomatorButton(introductionChannel);

        await Meta.introductionAutomator.setIntroductionButtonChannelId(
            introductionChannel.id
        );
        await Meta.introductionAutomator.setScreeningChannelId(
            screeningChannel.id
        );

        interaction.editReply(
            `Introduction button added to ${introductionChannel}`
        );
    }
};
