import {
    ActionRowBuilder,
    ButtonBuilder,
    Guild,
    TextBasedChannel,
    TextChannel
} from "discord.js";
import assert from "node:assert";
import { create as createButton } from "../../buttons/introductionCreate/helpers";
import { Meta } from "../../controllers/Meta";

export const createIntroductionAutomatorButton = async (
    channel: TextBasedChannel
) => {
    const newButton = createButton();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(newButton);
    const newMessage = await channel.send({
        components: [row]
    });
    await Meta.introductionAutomator.setMessageId(newMessage.id);
};

export const deleteIntroductionAutomatorButton = async (guild: Guild) => {
    const {
        channelId: oldChannelId,
        messageId: oldMessageId
    } = Meta.introductionAutomator;

    await Meta.introductionAutomator.setMessageId(null);

    try {
        assert(oldChannelId !== null);

        const oldChannel = await guild.channels.fetch(oldChannelId, {
            force: true
        });

        assert(oldChannel !== null);
        assert(oldChannel instanceof TextChannel);
        assert(oldMessageId !== null);

        const oldMessage = await oldChannel.messages.fetch(oldMessageId);
        await oldMessage.delete();
        return true;
    } catch {
        return false;
    }
};
