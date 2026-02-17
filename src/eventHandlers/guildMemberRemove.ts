import { BaseInteraction, Events } from "discord.js";
import { randomUUID } from "node:crypto";
import { Meta } from "../controllers/Meta";

export const guildMemberRemove = {
    name: Events.GuildMemberRemove,
    async execute(interaction: BaseInteraction) {
        const id = randomUUID();

        await Meta.logDebug(id, "guildMemberRemove", `${interaction.type}`);

        const existingIntroduction = Meta.introductionAutomator.getIntroduction(
            {
                userId: interaction.user.id
            }
        );

        if (!existingIntroduction) {
            await Meta.logDebug(
                id,
                "no introduction to remove",
                `userId: ${interaction.user.id}`
            );
            return;
        }

        await Meta.introductionAutomator.removeIntroduction(
            existingIntroduction.id
        );

        await Meta.logDebug(
            id,
            "removed users introduction",
            `userId: ${interaction.user.id}`
        );
    }
};

export default guildMemberRemove;
