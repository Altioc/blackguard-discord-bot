import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { InteractionHandler } from "./InteractionHandler";

export type BotCommandWithoutSubcommands =
    & InteractionHandler<ChatInputCommandInteraction>
    & {
        serialize: () => Partial<SlashCommandBuilder>;
        superUserOnly?: boolean;
    };
