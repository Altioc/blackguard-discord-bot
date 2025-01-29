import { ButtonInteraction, GuildMember } from "discord.js";
import assert from "node:assert";
import { create as createModal } from "../../modals/introduction/helpers";
import { buttonId } from "./helpers";

export default {
    data: {
        name: buttonId
    },

    interact: async (interaction: ButtonInteraction) => {
        assert(interaction.member !== null);

        const member = interaction.member instanceof GuildMember
            ? await interaction.member.fetch(true)
            : interaction.member;

        const possibleRoles = ["blackguard", "guest", "duskfallen"];

        const roles = member.roles instanceof Array
            ? member.roles
            : member.roles.cache;

        const alreadyIntroduced = roles.some(role => {
            let standardizedRoleName: string;

            if (typeof role === "string") {
                standardizedRoleName = role.toLowerCase().trim();
            } else {
                standardizedRoleName = role.name.toLowerCase().trim();
            }

            return possibleRoles.includes(standardizedRoleName);
        });

        if (alreadyIntroduced) {
            await interaction.reply({
                content: "You've already introduced yourself",
                ephemeral: true
            });
        } else {
            const modal = createModal(interaction.user.id);
            await interaction.showModal(modal);
        }
    }
};
