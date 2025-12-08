import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { Add } from "./subcommands/Add";
import { Create } from "./subcommands/Create";
import { Deduct } from "./subcommands/Deduct";
import { Delete } from "./subcommands/Delete";

const WalletAdmin: BotCommand = {
    name: "wallet-admin",

    subcommands: new Map([
        [Add.name, Add],
        [Create.name, Create],
        [Deduct.name, Deduct],
        [Delete.name, Delete]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(WalletAdmin.name)
            .setDescription(
                "The admin command for all things involving wallets."
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setContexts(InteractionContextType.Guild);

        WalletAdmin.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = WalletAdmin.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.editReply(messages.unknownError());
        }
    }
};

export default WalletAdmin;
