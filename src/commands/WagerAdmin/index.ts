import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { Close } from "./subcommands/Close";
import { End } from "./subcommands/End";
import { Open } from "./subcommands/Open";
import { Reactivate } from "./subcommands/Reactivate";

const WagerAdmin: BotCommand = {
    name: "wager-admin",

    subcommands: new Map([
        [Close.name, Close],
        [End.name, End],
        [Open.name, Open],
        [Reactivate.name, Reactivate]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(WagerAdmin.name)
            .setDescription(
                "The base command for all things involving wagers."
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setContexts(InteractionContextType.Guild);

        WagerAdmin.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = WagerAdmin.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.editReply(messages.unknownError());
        }
    }
};

export default WagerAdmin;
