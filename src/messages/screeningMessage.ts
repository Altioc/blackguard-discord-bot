import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { setIntroductionRoleButton } from "../buttons/setIntroductionRoleButton";
import {
    IntroductionScreeningStatus,
    IntroductionScreeningStatusColors
} from "../constants";
import { Meta } from "../controllers/Meta";
import { Introduction } from "../models/Introduction";
import { ScreeningMessageOptions } from "../types/ScreeningMessageOptions";
import { introductionMessage } from "./introductionMessage";

export const screeningMessage = {
    create: async (
        introduction: Introduction,
        { screenerId, resolved }: ScreeningMessageOptions = { resolved: false }
    ) => {
        assert(Meta.rejectedRole !== null);

        const id = randomUUID();

        Meta.logDebug(
            id,
            "screeningMessage",
            "create",
            JSON.stringify(introduction),
            screenerId || "",
            resolved.toString()
        );

        const screeningMessage = await introductionMessage.create(
            introduction
        );

        const screeningEmbed = screeningMessage.embeds[0];

        const guild = await Meta.client.guilds.fetch(introduction.guildId);

        if (screenerId) {
            const screener = await guild.members.fetch(screenerId);

            assert(screener);

            screeningEmbed.setFooter({
                text: `Reviewed by: ${screener.user.username}`
            });
        }

        switch (introduction.status) {
            case IntroductionScreeningStatus.Pending: {
                screeningEmbed.setColor(
                    IntroductionScreeningStatusColors[
                        IntroductionScreeningStatus.Pending
                    ]
                );
                break;
            }
            case IntroductionScreeningStatus.Accepted: {
                screeningEmbed.setTitle("Accepted");
                screeningEmbed.setColor(
                    IntroductionScreeningStatusColors[
                        IntroductionScreeningStatus.Accepted
                    ]
                );
                break;
            }
            case IntroductionScreeningStatus.Rejected: {
                screeningEmbed.setTitle("Rejected");
                screeningEmbed.setColor(
                    IntroductionScreeningStatusColors[
                        IntroductionScreeningStatus.Rejected
                    ]
                );
                break;
            }
        }

        const memberRoles = await Promise.all(
            Array.from(Meta.memberRoles).map((roleId) =>
                guild.roles.fetch(roleId)
            )
        );

        const roleButtons: ButtonBuilder[] = [];

        for (const role of memberRoles) {
            if (role === null) {
                continue;
            }

            const button = await setIntroductionRoleButton.create(
                role.id,
                introduction.id,
                role.name,
                resolved,
                false
            );

            roleButtons.push(button);
        }

        const rejectButton = await setIntroductionRoleButton.create(
            Meta.rejectedRole,
            introduction.id,
            "Reject",
            resolved,
            true
        );

        roleButtons.push(rejectButton);

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(roleButtons);

        return {
            embeds: [screeningEmbed],
            components: [actionRow]
        };
    }
};
