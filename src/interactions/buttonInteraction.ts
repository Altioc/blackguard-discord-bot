import { ButtonInteraction } from "discord.js";
import { buttons } from "../constants/interactionHandlers";

export const buttonInteraction = {
    async execute(interaction: ButtonInteraction) {
        const { customId } = interaction;
        const [buttonId, ...parts] = customId.split("/");
        const button = buttons.get(buttonId);

        if (!button) {
            return;
        }

        try {
            await button.interact(interaction, parts);
        } catch (error) {
            console.log(error, "button -> interact");
        }
    }
};
