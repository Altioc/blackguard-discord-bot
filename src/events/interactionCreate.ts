import {
    BaseInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Events,
    ModalSubmitInteraction
} from "discord.js";
import { InteractionType } from "../constants";
import { buttonInteraction } from "../interactions/button";
import { commandInteraction } from "../interactions/command";
import { modalInteraction } from "../interactions/modal";
import { getInteractionType } from "../utils/getInteractionType";

export default {
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
