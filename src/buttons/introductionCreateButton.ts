import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    GuildMember
} from "discord.js";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { Meta } from "../controllers/Meta";
import { introductionModal } from "../modals/introductionModal";

const buttonName = "introduction-create";

export const introductionCreateButton = {
    name: buttonName,

    create: () => {
        return new ButtonBuilder()
            .setCustomId(buttonName)
            .setLabel("Introduce yourself!")
            .setStyle(ButtonStyle.Primary);
    },

    interact: async (interaction: ButtonInteraction) => {
        assert(interaction.member !== null);

        const id = randomUUID();

        await Meta.logDebug(
            interaction,
            id,
            "introductionCreateButton",
            "interact"
        );

        const member = interaction.member instanceof GuildMember
            ? await interaction.member.fetch(true)
            : interaction.member;

        const existingIntroduction = Meta.introductionAutomator.getIntroduction(
            {
                userId: member.user.id
            }
        );

        const alreadyIntroduced = existingIntroduction !== null;

        if (alreadyIntroduced) {
            await Meta.logDebug(
                interaction,
                id,
                "introductionCreateButton",
                "interact",
                "already introduced"
            );
            await interaction.reply({
                content: "You've already introduced yourself",
                ephemeral: true
            });
        } else {
            const modal = introductionModal.create(interaction.user.id);
            await interaction.showModal(modal);
        }
    }
};

export default introductionCreateButton;
