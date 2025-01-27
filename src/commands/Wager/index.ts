import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { BotCommand } from "../../types/BotCommand";
import { Bet } from "./subcommands/Bet";
import { Close } from "./subcommands/Close";
import { End } from "./subcommands/End";
import { Open } from "./subcommands/Open";
import { Reactivate } from "./subcommands/Reactivate";
import { Read } from "./subcommands/Read";
import { Start } from "./subcommands/Start";

const Wager: BotCommand = {
    data: new SlashCommandBuilder()
        .setName("wager")
        .setDescription("The base command for all things involving wagers.")
        .addSubcommand(Bet.subCommandData)
        .addSubcommand(Close.subCommandData)
        .addSubcommand(End.subCommandData)
        .addSubcommand(Open.subCommandData)
        .addSubcommand(Reactivate.subCommandData)
        .addSubcommand(Read.subCommandData)
        .addSubcommand(Start.subCommandData),

    requiredRoles: ["Blackguard", "Guest"],

    async execute(interaction) {
        await interaction.deferReply();
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "bet": {
                await Bet.execute(interaction);
                break;
            }
            case "close": {
                await Close.execute(interaction);
                break;
            }
            case "end": {
                await End.execute(interaction);
                break;
            }
            case "open": {
                await Open.execute(interaction);
                break;
            }
            case "reactivate": {
                await Reactivate.execute(interaction);
                break;
            }
            case "read": {
                await Read.execute(interaction);
                break;
            }
            case "start": {
                await Start.execute(interaction);
                break;
            }
            default: {
                await interaction.editReply(messages.unknownError());
            }
        }
    }
};

export default Wager;
