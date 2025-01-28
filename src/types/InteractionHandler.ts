import { BaseInteraction } from "discord.js";

export type InteractionHandler<InteractionType extends BaseInteraction> = {
    name: string;
    execute: (interaction: InteractionType) => Promise<void>;
    canExecute?: (
        interaction: InteractionType
    ) => Promise<boolean>;
};
