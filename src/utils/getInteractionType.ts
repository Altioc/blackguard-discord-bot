import { BaseInteraction } from "discord.js";
import { InteractionType } from "../constants";

export const getInteractionType = (
    interaction: BaseInteraction
): string | undefined => {
    const expectedInteractionTypes = [
        {
            name: InteractionType.Command,
            selected: interaction.isCommand()
        },
        {
            name: InteractionType.Button,
            selected: interaction.isButton()
        },
        {
            name: InteractionType.Modal,
            selected: interaction.isModalSubmit()
        }
    ];

    return expectedInteractionTypes.find(interactionType =>
        interactionType.selected
    )?.name;
};
