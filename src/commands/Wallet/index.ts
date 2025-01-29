import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { And, AuthorOf, Or } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { canExecuteSubcommand } from "../../utils/canExecuteSubcommand";
import { Add } from "./subcommands/Add";
import { Create } from "./subcommands/Create";
import { Deduct } from "./subcommands/Deduct";
import { Delete } from "./subcommands/Delete";
import { Deposit } from "./subcommands/Deposit";
import { Read } from "./subcommands/Read";
import { Send } from "./subcommands/Send";
import { Withdrawal } from "./subcommands/Withdrawal";

const Wallet: BotCommand = {
    name: "wallet",

    subcommands: new Map([
        [Add.name, Add],
        [Create.name, Create],
        [Deduct.name, Deduct],
        [Delete.name, Delete],
        [Deposit.name, Deposit],
        [Read.name, Read],
        [Send.name, Send],
        [Withdrawal.name, Withdrawal]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Wallet.name)
            .setDescription(
                "The base command for all things involving wallets."
            );

        Wallet.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    canExecute: async (interaction) => {
        return And(
            Or(
                AuthorOf(interaction).has("blackguard"),
                AuthorOf(interaction).has("guest")
            ),
            canExecuteSubcommand(
                interaction,
                Wallet.subcommands
            )
        );
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Wallet.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.editReply(messages.unknownError());
        }
    }
};

export default Wallet;
