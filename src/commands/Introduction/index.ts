import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { Create } from "./subcommands/Create";
import { Delete } from "./subcommands/Delete";

const Introduce: BotCommand = {
    name: "introduction-automator",

    subcommands: new Map([
        [Create.name, Create],
        [Delete.name, Delete]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Introduce.name)
            .setDescription("Create/Delete the introduction automator")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setContexts(InteractionContextType.Guild);

        Introduce.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    execute: async (interaction) => {
        await interaction.deferReply({
            ephemeral: true
        });

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Introduce.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.editReply(messages.unknownError());
        }
    }
};

export default Introduce;
