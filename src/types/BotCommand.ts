import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

export type BotCommand = {
    data:
        | SlashCommandBuilder
        | SlashCommandSubcommandsOnlyBuilder
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    requiredRoles: string[];
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};
