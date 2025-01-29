import { ButtonBuilder, ButtonStyle } from "discord.js";

export const buttonId = "introduction-create";

export const create = () => {
    return new ButtonBuilder()
        .setCustomId(buttonId)
        .setLabel("Introduce yourself!")
        .setStyle(ButtonStyle.Primary);
};
