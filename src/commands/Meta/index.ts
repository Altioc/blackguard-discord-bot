import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { superUsers } from "../../ids.json";
import { AuthorOf, Or } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { AddMemberRole } from "./subcommands/AddMemberRole";
import { RemoveLoggingChannel } from "./subcommands/RemoveLoggingChannel";
import { RemoveMemberRole } from "./subcommands/RemoveMemberRole";
import { SetLoggingChannel } from "./subcommands/SetLoggingChannel";
import { SetLogLevel } from "./subcommands/SetLogLevel";
import { SetRejectedRole } from "./subcommands/SetRejectedRole";

const Meta: BotCommand = {
    name: "meta",

    subcommands: new Map([
        [AddMemberRole.name, AddMemberRole],
        [RemoveMemberRole.name, RemoveMemberRole],
        [SetRejectedRole.name, SetRejectedRole],
        [SetLoggingChannel.name, SetLoggingChannel],
        [RemoveLoggingChannel.name, RemoveLoggingChannel],
        [SetLogLevel.name, SetLogLevel]
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
