import { SlashCommandBuilder } from "discord.js";
import assert from "node:assert";
import { messages } from "../../constants";
import ids from "../../ids.json";
import { BotCommand } from "../../types/BotCommand";
import { Get } from "./subcommands/Get";
import { Reset } from "./subcommands/Reset";
import { Set } from "./subcommands/Set";

const Doc: BotCommand = {
    data: new SlashCommandBuilder()
        .setName("doc")
        .setDescription("The base command for all things involving docs.")
        .addSubcommand(Get.subCommandData)
        .addSubcommand(Set.subCommandData)
        .addSubcommand(Reset.subCommandData),

    requiredRoles: ["Blackguard"],

    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true
        });
        const subCommand = interaction.options.getSubcommand();

        assert(interaction.member !== null);

        if (!ids.superUsers.includes(interaction.member.user.id)) {
            await interaction.editReply(messages.incorrectPermissions());
            return;
        }

        switch (subCommand) {
            case "get": {
                await Get.execute(interaction);
                break;
            }
            case "set": {
                await Set.execute(interaction);
                break;
            }
            case "reset": {
                await Reset.execute(interaction);
                break;
            }
            default: {
                await interaction.editReply(messages.unknownError());
            }
        }
    }
};

export default Doc;
