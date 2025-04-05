import assert from "node:assert";
import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";
import { deleteIntroductionAutomatorButton } from "../helpers";

export const Delete: BotSubcommand = {
    name: "delete",

    serialize: (subcommand) => {
        return subcommand
            .setName(Delete.name)
            .setDescription("Deletes the introduction automator");
    },

    execute: async (interaction) => {
        assert(interaction.guild !== null);

        const buttonWasDeleted = await deleteIntroductionAutomatorButton(
            interaction.guild
        );

        await Meta.introductionAutomator.setPublicChannelId(null);

        if (buttonWasDeleted) {
            interaction.editReply(`Introduction automator removed`);
        } else {
            interaction.editReply(
                `Could not find existing introduction automator`
            );
        }
    }
};
