import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BotSubcommand } from "./BotSubcommand";
import { InteractionHandler } from "./InteractionHandler";

export type BotCommand =
    & InteractionHandler<ChatInputCommandInteraction>
    & {
        subcommands: Map<string, BotSubcommand>;
        serialize: () => Partial<SlashCommandBuilder>;
    };
