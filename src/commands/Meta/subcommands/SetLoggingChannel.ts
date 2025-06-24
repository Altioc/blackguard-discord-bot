import { ChannelType, TextChannel } from "discord.js";
import assert from "node:assert";
import { LogLevel } from "../../../constants";
import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const SetLoggingChannel: BotSubcommand = {
    name: "set-logging-channel",

    serialize: (subcommand) => {
        return subcommand
            .setName(SetLoggingChannel.name)
            .setDescription(
                "Sets the channel that Botlet will output logs to"
            )
            .addChannelOption(option => (
                option
                    .setName("channel")
                    .setDescription("The channel to output logs to")
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const loggingChannel = options.getChannel("channel");

        assert(loggingChannel !== null);

        if (loggingChannel.type !== ChannelType.GuildText) {
            await interaction.editReply(
                "Only text-based channels are allowed."
            );
            return;
        }

        await Meta.setLoggingChannel(loggingChannel as TextChannel);

        await interaction.editReply({
            content: `Set logging channel to: ${loggingChannel.name}`
        });
    }
};
