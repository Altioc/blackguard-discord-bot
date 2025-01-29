import { ChatInputCommandInteraction } from "discord.js";
import { BotSubcommand } from "../types/BotSubcommand";

export const canExecuteSubcommand = async (
    interaction: ChatInputCommandInteraction,
    subcommands: Map<string, BotSubcommand>
): Promise<boolean> => {
    const { options } = interaction;

    const subcommandName = options.getSubcommand();

    const subcommand = subcommands.get(subcommandName);

    const canExecuteSubcommandResult = await subcommand?.canExecute?.(
        interaction
    );

    return canExecuteSubcommandResult !== false;
};
