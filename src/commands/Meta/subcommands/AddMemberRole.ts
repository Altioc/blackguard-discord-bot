import assert from "node:assert";
import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const AddMemberRole: BotSubcommand = {
    name: "add-member-role",

    serialize: (subcommand) => {
        return subcommand
            .setName(AddMemberRole.name)
            .setDescription(
                "Add a role id that is considered a member of this guild"
            )
            .addRoleOption(option => (
                option
                    .setName("role")
                    .setDescription("The role to add")
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const role = options.getRole("role");

        assert(role !== null);

        await Meta.addMemberRole(role.id);

        await interaction.editReply({
            content: `Added member role: ${role}`
        });
    }
};
