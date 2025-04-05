import {
    BaseInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Events,
    ModalSubmitInteraction
} from "discord.js";
import { InteractionType } from "../constants";
import { buttonInteraction } from "../interactions/buttonInteraction";
import { commandInteraction } from "../interactions/commandInteraction";
import { modalInteraction } from "../interactions/modalInteraction";
import { getInteractionType } from "../utils/getInteractionType";

export const interactionCreEventHandler = {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (interaction.guild === null) {
            return;
        }

        await interaction.guild.fetch();

        switch (getInteractionType(interaction)) {
            case InteractionType.Command: {
                return commandInteraction.execute(
                    interaction as ChatInputCommandInteraction
                );
            }
            case InteractionType.Button: {
                return buttonInteraction.execute(
                    interaction as ButtonInteraction
                );
            }
            case InteractionType.Modal: {
                return modalInteraction.execute(
                    interaction as ModalSubmitInteraction
                );
            }
            default: {
                return;
            }
        }
    }
};

export default interactionCreEventHandler;
