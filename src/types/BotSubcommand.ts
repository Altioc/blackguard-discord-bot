import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from "discord.js";
import { InteractionHandler } from "./InteractionHandler";

export type BotSubcommand = InteractionHandler<ChatInputCommandInteraction> & {
    serialize: (
        builder: SlashCommandSubcommandBuilder
    ) => SlashCommandSubcommandBuilder;
};
