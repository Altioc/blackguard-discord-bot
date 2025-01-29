import { SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
import { AuthorOf, Or } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";
import { Adele56k } from "./subcommands/Adele56k.js";
import { BlessYourHeart } from "./subcommands/BlessYourHeart";
import { BoostedLol } from "./subcommands/BoostedLol";
import { DarkSight } from "./subcommands/DarkSight";
import { Disgusting } from "./subcommands/Disgusting";
import { Females } from "./subcommands/Females.js";
import { Hero } from "./subcommands/Hero";
import { ImJustDone } from "./subcommands/ImJustDone";
import { JustBeGood } from "./subcommands/JustBeGood";
import { KidsTalkingShit } from "./subcommands/KidsTalkingShit";
import { LightNovel } from "./subcommands/LightNovel";
import { Misinformation } from "./subcommands/Misinformation";
import { Misplay } from "./subcommands/Misplay";
import { NotNormally } from "./subcommands/NotNormally";
import { OakBa } from "./subcommands/OakBa";
import { OccasionalAttack } from "./subcommands/OccasionalAttack";
import { PleaseRefrain } from "./subcommands/PleaseRefrain";
import { RunCulvert } from "./subcommands/RunCulvert";
import { SillyChild } from "./subcommands/SillyChild";
import { SingleThought } from "./subcommands/SingleThought";
import { StrengthReward } from "./subcommands/StrengthReward";
import { WhoDoYouKnow } from "./subcommands/WhoDoYouKnow";

const Copypasta: BotCommand = {
    name: "copypasta",

    subcommands: new Map([
        [Adele56k.name, Adele56k],
        [BlessYourHeart.name, BlessYourHeart],
        [BoostedLol.name, BoostedLol],
        [DarkSight.name, DarkSight],
        [Disgusting.name, Disgusting],
        [Females.name, Females],
        [Hero.name, Hero],
        [ImJustDone.name, ImJustDone],
        [JustBeGood.name, JustBeGood],
        [KidsTalkingShit.name, KidsTalkingShit],
        [LightNovel.name, LightNovel],
        [Misinformation.name, Misinformation],
        [Misplay.name, Misplay],
        [NotNormally.name, NotNormally],
        [OakBa.name, OakBa],
        [OccasionalAttack.name, OccasionalAttack],
        [PleaseRefrain.name, PleaseRefrain],
        [RunCulvert.name, RunCulvert],
        [SillyChild.name, SillyChild],
        [SingleThought.name, SingleThought],
        [StrengthReward.name, StrengthReward],
        [WhoDoYouKnow.name, WhoDoYouKnow]
    ]),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Copypasta.name)
            .setDescription("Easy access to intellectual messages.");

        Copypasta.subcommands.forEach((subcommand) => {
            serialization.addSubcommand(subcommand.serialize);
        });

        return serialization;
    },

    canExecute: async (interaction) => {
        return Or(
            AuthorOf(interaction).has("blackguard"),
            AuthorOf(interaction).has("guest")
        );
    },

    execute: async (interaction) => {
        const subcommandName = interaction.options.getSubcommand();

        const subcommand = Copypasta.subcommands.get(subcommandName);

        try {
            await subcommand?.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply(messages.unknownError());
        }
    }
};

export default Copypasta;
