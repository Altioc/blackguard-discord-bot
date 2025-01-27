import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import assert from "node:assert";
import {
    createIntroductionAutomatorButton,
    deleteIntroductionAutomatorButton
} from "../../commands/Introduction/helpers";
import { elementIds, elementLabels, modalId } from "./helpers";

export default {
    data: {
        name: modalId
    },

    interact: async (
        interaction: ModalSubmitInteraction,
        [userId]: [string]
    ) => {
        assert(interaction.guild !== null);

        await deleteIntroductionAutomatorButton(interaction.guild);

        const { fields } = interaction;
        const preferedName = fields.getTextInputValue(elementIds.preferedName);
        const ign = fields.getTextInputValue(elementIds.ign);
        const pronouns = fields.getTextInputValue(elementIds.pronouns);
        const referral = fields.getTextInputValue(elementIds.referral);
        const joinReason = fields.getTextInputValue(elementIds.joinReason);

        assert(interaction.guild !== null);

        const user = await interaction.guild.members.fetch({
            user: userId,
            force: true
        });

        try {
            let newNickname = preferedName;

            if (ign && ign !== preferedName) {
                newNickname += ` (${ign})`;
            }

            if (newNickname.length > 32) {
                if (ign) {
                    await user.setNickname(ign);
                } else {
                    await user.setNickname(preferedName);
                }
            } else {
                await user.setNickname(newNickname);
            }
        } catch {}

        const optionalFields = [];

        if (pronouns) {
            optionalFields.push({
                name: elementLabels.pronouns,
                value: pronouns,
                inline: true
            });
        }

        if (ign) {
            optionalFields.push({
                name: elementLabels.ign,
                value: ign,
                inline: true
            });
        }

        const introduction = new EmbedBuilder()
            .setDescription(`${user}`)
            .addFields(
                {
                    name: elementLabels.preferedName,
                    value: preferedName,
                    inline: true
                },
                ...optionalFields,
                { name: elementLabels.referral, value: referral },
                { name: elementLabels.joinReason, value: joinReason }
            )
            .setImage(user.displayAvatarURL())
            .setTimestamp();

        assert(interaction.channel !== null);

        await interaction.channel.send({ embeds: [introduction] });

        assert(interaction.channel !== null);

        await createIntroductionAutomatorButton(interaction.channel);
        await interaction.reply({
            content: "Introduction submitted! Thank you",
            ephemeral: true
        });
    }
};
