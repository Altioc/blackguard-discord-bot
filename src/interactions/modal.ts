import { ModalSubmitInteraction } from "discord.js";
import { modals } from "../constants/interactionHandlers";

export const modalInteraction = {
    async execute(interaction: ModalSubmitInteraction) {
        const { customId } = interaction;
        const [modalId, ...parts] = customId.split("/");
        const modal = modals.get(modalId);

        if (!modal) {
            return;
        }

        try {
            await modal.interact(interaction, parts);
        } catch (error) {
            console.log(error, "modal -> interact");
        }
    }
};
