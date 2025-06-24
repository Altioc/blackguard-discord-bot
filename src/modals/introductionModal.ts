import {
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import {
    createIntroductionAutomatorButton,
    deleteIntroductionAutomatorButton
} from "../commands/Introduction/helpers";
import { IntroductionScreeningStatus } from "../constants";
import { introductionModalElements } from "../constants/introductionModalElements";
import { Meta } from "../controllers/Meta";
import { introductionMessage } from "../messages/introductionMessage";
import { screeningMessage } from "../messages/screeningMessage";
import { Introduction } from "../models/Introduction";

const modalName = "introduction";

export const introductionModal = {
    name: modalName,

    create: (userId: string) => {
        const modal = new ModalBuilder()
            .setCustomId(`${modalName}/${userId}`)
            .setTitle("Introduce Yourself");

        const {
            preferedName,
            pronouns,
            ign,
            referral,
            joinReason
        } = introductionModalElements;

        const preferedNameInput = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId(preferedName.id)
                    .setLabel(preferedName.label)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(32)
                    .setRequired(true)
            );

        const pronounsInput = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId(pronouns.id)
                    .setLabel(pronouns.label)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(1024)
                    .setRequired(false)
            );

        const ignInput = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId(ign.id)
                    .setLabel(ign.label)
                    .setMaxLength(32)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            );

        const referralInput = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId(referral.id)
                    .setLabel(referral.label)
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(1024)
                    .setRequired(true)
            );

        const joinReasonInput = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId(joinReason.id)
                    .setLabel(joinReason.label)
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(1024)
                    .setRequired(true)
            );

        modal.addComponents(
            preferedNameInput,
            pronounsInput,
            ignInput,
            referralInput,
            joinReasonInput
        );

        return modal;
    },

    interact: async (
        interaction: ModalSubmitInteraction,
        [userId]: [string]
    ) => {
        assert(interaction.guild !== null);

        const id = randomUUID();

        await Meta.logDebug(
            interaction,
            "introductionModal",
            "interact",
            id,
            userId
        );

        await deleteIntroductionAutomatorButton(interaction.guild);

        const { fields } = interaction;

        const preferedName = fields.getTextInputValue(
            introductionModalElements.preferedName.id
        );
        const ign = fields.getTextInputValue(
            introductionModalElements.ign.id
        );
        const pronouns = fields.getTextInputValue(
            introductionModalElements.pronouns.id
        );
        const referral = fields.getTextInputValue(
            introductionModalElements.referral.id
        );
        const joinReason = fields.getTextInputValue(
            introductionModalElements.joinReason.id
        );

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

        assert(interaction.channel !== null);

        const introduction = new Introduction({
            userId,
            channelId: interaction.channel.id,
            status: IntroductionScreeningStatus.Pending,
            guildId: interaction.guild.id,
            preferedName,
            ign,
            pronouns,
            referral,
            joinReason
        });

        const messageContent = await introductionMessage.create(introduction);

        const message = await interaction.channel.send(messageContent);

        await Meta.logDebug(
            id,
            "introductionModal",
            "interact",
            "sent introduction"
        );

        introduction.messageId = message.id;

        await Meta.introductionAutomator.addIntroduction(introduction);

        const { screeningChannelId } = Meta.introductionAutomator;

        assert(screeningChannelId !== null);

        const screeningChannel = await interaction.guild.channels.fetch(
            screeningChannelId
        );

        assert(screeningChannel !== null);
        assert(screeningChannel.isTextBased());

        const screening = await screeningMessage.create(introduction);

        await screeningChannel.send(screening);

        await Meta.logDebug(
            id,
            "introductionModal",
            "interact",
            "sent screening"
        );

        await createIntroductionAutomatorButton(interaction.channel);
        await interaction.reply({
            content: "Introduction submitted! Thank you",
            ephemeral: true
        });
    }
};

export default introductionModal;
