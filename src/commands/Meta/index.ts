import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { superUsers } from "../../ids.json";
import { AuthorOf, Or } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { AddMemberRole } from "./subcommands/AddMemberRole.js";
import { RemoveMemberRole } from "./subcommands/RemoveMemberRole.js";
import { SetRejectedRole } from "./subcommands/SetRejectedRole.js";

const Meta: BotCommand = {
    name: "meta",

    subcommands: new Map([
        [AddMemberRole.name, AddMemberRole],
        [RemoveMemberRole.name, RemoveMemberRole],
        [SetRejectedRole.name, SetRejectedRole]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Meta.name)
            .setDescription("Commands to modify values specific to this guild");

        Meta.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    canExecute: async (interaction) => {
        return Or(
            AuthorOf(interaction).is(superUsers),
            AuthorOf(interaction).has(PermissionFlagsBits.Administrator)
        );
    },

    execute: async (interaction) => {
        await interaction.deferReply({
            ephemeral: true
        });

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Meta.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply(messages.unknownError());
        }
    }
};

export default Meta;
