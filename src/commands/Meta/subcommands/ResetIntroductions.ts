import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const ResetIntroductions: BotSubcommand = {
    name: "reset-introductions",

    serialize: (subcommand) => {
        return subcommand
            .setName(ResetIntroductions.name)
            .setDescription(
                "Reset all of the introductions stored"
            );
    },

    execute: async (interaction) => {
        await Meta.introductionAutomator.resetIntroductions();

        await interaction.editReply({
            content: "Introductions reset"
        });
    }
};
