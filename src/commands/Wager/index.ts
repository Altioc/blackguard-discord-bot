import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { And, AuthorOf, Or } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { canExecuteSubcommand } from "../../utils/canExecuteSubcommand";
import { Bet } from "./subcommands/Bet";
import { Close } from "./subcommands/Close";
import { End } from "./subcommands/End";
import { Open } from "./subcommands/Open";
import { Reactivate } from "./subcommands/Reactivate";
import { Read } from "./subcommands/Read";
import { Start } from "./subcommands/Start";

const Wager: BotCommand = {
    name: "wager",

    subcommands: new Map([
        [Bet.name, Bet],
        [Close.name, Close],
        [End.name, End],
        [Open.name, Open],
        [Reactivate.name, Reactivate],
        [Read.name, Read],
        [Start.name, Start]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Wager.name)
            .setDescription(
                "The base command for all things involving wagers."
            );

        Wager.subcommands.forEach((subcommand) => {
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
                Wager.subcommands
            )
        );
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Wager.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.editReply(messages.unknownError());
        }
    }
};

export default Wager;
