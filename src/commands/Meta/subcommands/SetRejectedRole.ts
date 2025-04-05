import assert from "node:assert";
import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const SetRejectedRole: BotSubcommand = {
    name: "set-rejected-role",

    serialize: (subcommand) => {
        return subcommand
            .setName(SetRejectedRole.name)
            .setDescription(
                "Sets the role that represents someone that is rejected"
            )
            .addRoleOption(option => (
                option
                    .setName("role")
                    .setDescription("The role to set")
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const role = options.getRole("role");

        assert(role !== null);

        await Meta.setRejectedRole(role.id);

        await interaction.editReply({
            content: `Set rejected role to: ${role}`
        });
    }
};
