import { ChatInputCommandInteraction } from "discord.js";
import assert from "node:assert";
import { commands } from "../constants/interactionHandlers";
import { superUsers } from "../ids.json";
import { BotCommand } from "../types/BotCommand";

export const commandInteraction = {
    async execute(interaction: ChatInputCommandInteraction) {
        const { commandName, user } = interaction;
        const command = commands.get(commandName);

        try {
            assert(command !== undefined);

            const isSuperUser = superUsers.includes(user.id);

            if (isSuperUser) {
                return executeCommand(command, interaction);
            }

            const canExecuteCommand = command.canExecute === undefined
                ? true
                : command.canExecute(interaction);

            assert(canExecuteCommand);

            return executeCommand(command, interaction);
        } catch {
            return interaction.reply({
                content: "You do not have permission to run this command.",
                ephemeral: true
            });
        }
    }
};

const executeCommand = async (
    command: BotCommand,
    interaction: ChatInputCommandInteraction
) => {
    try {
        await command.execute(interaction);
    } catch (error) {
        console.log(error, "command -> execute");
    }
};
