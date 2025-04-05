import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    GuildMember
} from "discord.js";
import assert from "node:assert";
import { IntroductionScreeningStatus } from "../constants";
import { Meta } from "../controllers/Meta";
import { screeningMessage } from "../messages/screeningMessage";

const buttonName = "set-introduction-role";

export const setIntroductionRoleButton = {
    name: buttonName,

    create: async (
        roleId: string,
        introductionId: string,
        label: string,
        resolved: boolean,
        isRejection: boolean
    ) => {
        return new ButtonBuilder()
            .setCustomId(
                `${buttonName}/${roleId}/${introductionId}/${
                    isRejection ? "true" : "false"
                }`
            )
            .setLabel(label)
            .setStyle(isRejection ? ButtonStyle.Danger : ButtonStyle.Primary)
            .setDisabled(resolved);
    },

    interact: async (
        interaction: ButtonInteraction,
        [roleId, introductionId, isRejectionRaw]: [string, string, string]
    ) => {
        assert(interaction.member !== null);
        assert(interaction.guild !== null);

        const isRejection = isRejectionRaw === "true";

        const screener = interaction.member instanceof GuildMember
            ? await interaction.member.fetch(true)
            : interaction.member;

        const introduction = Meta.introductionAutomator.getIntroduction({
            introductionId
        });

        assert(introduction !== null);

        const { userId, channelId, messageId } = introduction;

        assert(messageId !== undefined);

        const screened = await interaction.guild.members.fetch(userId);

        assert(screened !== null);

        await screened.roles.add(roleId);

        const messageChannel = await interaction.guild.channels.fetch(
            channelId
        );

        assert(messageChannel !== null);
        assert(messageChannel.isTextBased());

        const introductionUpdate = {
            ...introduction,
            status: isRejection
                ? IntroductionScreeningStatus.Rejected
                : IntroductionScreeningStatus.Accepted
        };

        await Meta.introductionAutomator.updateIntroduction(introductionUpdate);

        const newMessage = await screeningMessage.create(
            introductionUpdate,
            {
                screenerId: screener.user.id,
                resolved: true
            }
        );

        interaction.message.edit(newMessage);

        const role = await interaction.guild.roles.fetch(roleId);

        await interaction.reply({
            content: `User updated with role: ${role}`,
            ephemeral: true
        });
    }
};

export default setIntroductionRoleButton;
