import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { messages } from "../../constants";
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
    data: new SlashCommandBuilder()
        .setName("copypasta")
        .setDescription("Easy access to intellectual messages.")
        .addSubcommand(Adele56k.subCommandData)
        .addSubcommand(BlessYourHeart.subCommandData)
        .addSubcommand(BoostedLol.subCommandData)
        .addSubcommand(DarkSight.subCommandData)
        .addSubcommand(Disgusting.subCommandData)
        .addSubcommand(Females.subCommandData)
        .addSubcommand(Hero.subCommandData)
        .addSubcommand(ImJustDone.subCommandData)
        .addSubcommand(JustBeGood.subCommandData)
        .addSubcommand(KidsTalkingShit.subCommandData)
        .addSubcommand(LightNovel.subCommandData)
        .addSubcommand(Misinformation.subCommandData)
        .addSubcommand(Misplay.subCommandData)
        .addSubcommand(NotNormally.subCommandData)
        .addSubcommand(OakBa.subCommandData)
        .addSubcommand(OccasionalAttack.subCommandData)
        .addSubcommand(PleaseRefrain.subCommandData)
        .addSubcommand(RunCulvert.subCommandData)
        .addSubcommand(SillyChild.subCommandData)
        .addSubcommand(SingleThought.subCommandData)
        .addSubcommand(StrengthReward.subCommandData)
        .addSubcommand(WhoDoYouKnow.subCommandData),

    requiredRoles: ["Blackguard", "Guest"],

    async execute(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "hero": {
                await Hero.execute(interaction);
                break;
            }
            case "darksight": {
                await DarkSight.execute(interaction);
                break;
            }
            case "disgusting": {
                await Disgusting.execute(interaction);
                break;
            }
            case "notnormally": {
                await NotNormally.execute(interaction);
                break;
            }
            case "strengthreward": {
                await StrengthReward.execute(interaction);
                break;
            }
            case "oakba": {
                await OakBa.execute(interaction);
                break;
            }
            case "whodoyouknow": {
                await WhoDoYouKnow.execute(interaction);
                break;
            }
            case "sillychild": {
                await SillyChild.execute(interaction);
                break;
            }
            case "occasionalattack": {
                await OccasionalAttack.execute(interaction);
                break;
            }
            case "56kadele": {
                await Adele56k.execute(interaction);
                break;
            }
            case "misinformation": {
                await Misinformation.execute(interaction);
                break;
            }
            case "misplay": {
                await Misplay.execute(interaction);
                break;
            }
            case "singlethought": {
                await SingleThought.execute(interaction);
                break;
            }
            case "blessyourheart": {
                await BlessYourHeart.execute(interaction);
                break;
            }
            case "runculvert": {
                await RunCulvert.execute(interaction);
                break;
            }
            case "pleaserefrain": {
                await PleaseRefrain.execute(interaction);
                break;
            }
            case "kidstalkingshit": {
                await KidsTalkingShit.execute(interaction);
                break;
            }
            case "justbegood": {
                await JustBeGood.execute(interaction);
                break;
            }
            case "lightnovel": {
                await LightNovel.execute(interaction);
                break;
            }
            case "imjustdone": {
                await ImJustDone.execute(interaction);
                break;
            }
            case "boostedlol": {
                await BoostedLol.execute(interaction);
                break;
            }
            case "female": {
                await Females.execute(interaction);
                break;
            }
            default: {
                await interaction.editReply(messages.unknownError());
            }
        }
    }
};

export default Copypasta;
