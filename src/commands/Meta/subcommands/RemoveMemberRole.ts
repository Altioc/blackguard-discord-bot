import assert from "node:assert";
import { Meta } from "../../../controllers/Meta";
import { BotSubcommand } from "../../../types/BotSubcommand";

export const RemoveMemberRole: BotSubcommand = {
    name: "remove-member-role",

    serialize: (subcommand) => {
        return subcommand
            .setName(RemoveMemberRole.name)
            .setDescription(
                "Remove a role id that is considered a member of this guild"
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

        if (!Meta.memberRoles.has(role.id)) {
            await interaction.editReply({
                content: `Role: ${role} is not a member role`
            });
            return;
        }

        await Meta.removeMemberRole(role.id);

        await interaction.editReply({
            content: `Removed member role: ${role}`
        });
    }
};
