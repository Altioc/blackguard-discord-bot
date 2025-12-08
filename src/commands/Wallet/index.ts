import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { Deposit } from "./subcommands/Deposit";
import { Read } from "./subcommands/Read";
import { Send } from "./subcommands/Send";
import { Withdrawal } from "./subcommands/Withdrawal";

const Wallet: BotCommand = {
    name: "wallet",

    subcommands: new Map([
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
            )
            .setDefaultMemberPermissions(0)
            .setContexts(InteractionContextType.Guild);

        Wallet.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
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
