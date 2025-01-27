import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { Create } from "./subcommands/Create";
import { Delete } from "./subcommands/Delete";

const Introduce: BotCommand = {
    data: new SlashCommandBuilder()
        .setName("introduction-automator")
        .setDescription("Create/Delete the introduction automator")
        .addSubcommand(Create.subCommandData)
        .addSubcommand(Delete.subCommandData),

    requiredRoles: ["Blackguard", "Duskfallen"],

    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true
        });

        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "create": {
                await Create.execute(interaction);
                break;
            }
            case "delete": {
                await Delete.execute(interaction);
                break;
            }
            default: {
                await interaction.editReply(messages.unknownError());
            }
        }
    }
};

export default Introduce;
