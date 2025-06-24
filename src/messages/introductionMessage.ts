import { EmbedBuilder } from "discord.js";
import { randomUUID } from "node:crypto";
import { introductionModalElements } from "../constants/introductionModalElements";
import { Meta } from "../controllers/Meta";
import { Introduction } from "../models/Introduction";

export const introductionMessage = {
    create: async (introduction: Introduction) => {
        const {
            guildId,
            userId,
            pronouns,
            ign,
            preferedName,
            referral,
            joinReason
        } = introduction;
        const guild = await Meta.client.guilds.fetch(guildId);

        const user = await guild.members.fetch(userId);

        const optionalFields = [];

        const id = randomUUID();

        Meta.logDebug(id, "introductionMessage", "create");

        if (pronouns) {
            optionalFields.push({
                name: introductionModalElements.pronouns.label,
                value: pronouns,
                inline: true
            });
        }

        if (ign) {
            optionalFields.push({
                name: introductionModalElements.ign.label,
                value: ign,
                inline: true
            });
        }

        const introductionEmbed = new EmbedBuilder()
            .setDescription(`${user}`)
            .addFields(
                {
                    name: introductionModalElements.preferedName.label,
                    value: preferedName,
                    inline: true
                },
                ...optionalFields,
                {
                    name: introductionModalElements.referral.label,
                    value: referral
                },
                {
                    name: introductionModalElements.joinReason.label,
                    value: joinReason
                }
            )
            .setImage(user.displayAvatarURL())
            .setTimestamp();

        return {
            embeds: [introductionEmbed]
        };
    }
};
