import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { Add } from "./subcommands/Add";
import { Create } from "./subcommands/Create";
import { Deduct } from "./subcommands/Deduct";
import { Delete } from "./subcommands/Delete";
import { Deposit } from "./subcommands/Deposit";
import { Read } from "./subcommands/Read";
import { Send } from "./subcommands/Send";
import { Withdrawal } from "./subcommands/Withdrawal";

const Wallet: BotCommand = {
    data: new SlashCommandBuilder()
        .setName("wallet")
        .setDescription("The base command for all things involving wallets.")
        .addSubcommand(Create.subCommandData)
        .addSubcommand(Add.subCommandData)
        .addSubcommand(Delete.subCommandData)
        .addSubcommand(Send.subCommandData)
        .addSubcommand(Read.subCommandData)
        .addSubcommand(Deduct.subCommandData)
        .addSubcommand(Deposit.subCommandData)
        .addSubcommand(Withdrawal.subCommandData),

    requiredRoles: ["Blackguard", "Guest"],

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "create": {
                await Create.execute(interaction);
                break;
            }
            case "add": {
                await Add.execute(interaction);
                break;
            }
            case "delete": {
                await Delete.execute(interaction);
                break;
            }
            case "send": {
                await Send.execute(interaction);
                break;
            }
            case "read": {
                await Read.execute(interaction);
                break;
            }
            case "deduct": {
                await Deduct.execute(interaction);
                break;
            }
            case "deposit": {
                await Deposit.execute(interaction);
                break;
            }
            case "withdrawal": {
                await Withdrawal.execute(interaction);
                break;
            }
            default: {
                await interaction.editReply(messages.unknownError());
            }
        }
    }
};

export default Wallet;
