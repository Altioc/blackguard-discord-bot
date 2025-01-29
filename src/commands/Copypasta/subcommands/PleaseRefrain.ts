import { BotSubcommand } from "../../../types/BotSubcommand";

export const PleaseRefrain: BotSubcommand = {
    name: "pleaserefrain",

    serialize: (subcommand) => {
        return subcommand
            .setName(PleaseRefrain.name)
            .setDescription("please refrain from making...")
            .addNumberOption(option => (
                option
                    .setName("count")
                    .setDescription(
                        "The amount of times to repeat the message. Default: 1, Max: 5"
                    )
                    .setMinValue(1)
                    .setMaxValue(5)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const countOption = Math.round(options.getNumber("count") || 1);

        const count = Math.max(Math.min(countOption, 5), 1);
        const singleResponse =
            "please refrain from making comments that could make others uncomfortable";

        const response = Array(count).fill(singleResponse).join("\n");

        interaction.reply(response);
    }
};
