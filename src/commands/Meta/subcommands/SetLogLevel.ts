import assert from "node:assert";
import { LogLevel } from "../../../constants";
import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const SetLogLevel: BotSubcommand = {
    name: "set-log-level",

    serialize: (subcommand) => {
        return subcommand
            .setName(SetLogLevel.name)
            .setDescription(
                "Sets the log level for Botlet"
            )
            .addNumberOption(option => (
                option
                    .setName("level")
                    .setDescription("The log level")
                    .addChoices(
                        { name: "Debug", value: LogLevel.Debug },
                        { name: "Info", value: LogLevel.Info },
                        { name: "Error", value: LogLevel.Error },
                        { name: "Off", value: LogLevel.Off }
                    )
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const logLevel = options.getNumber("level");

        assert(logLevel !== null);

        await Meta.setLogLevel(logLevel);

        await interaction.editReply({
            content: `Set log level to: ${logLevel}`
        });
    }
};
