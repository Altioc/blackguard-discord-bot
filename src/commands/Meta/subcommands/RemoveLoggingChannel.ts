import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const RemoveLoggingChannel: BotSubcommand = {
    name: "remove-logging-channel",

    serialize: (subcommand) => {
        return subcommand
            .setName(RemoveLoggingChannel.name)
            .setDescription(
                "Removes the logging channel output for Botlet logs"
            );
    },

    execute: async (interaction) => {
        await Meta.removeLoggingChannel();

        await interaction.editReply({
            content: `Removed logging channel`
        });
    }
};
