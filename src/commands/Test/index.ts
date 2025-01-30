import { SlashCommandBuilder } from "discord.js";
// import { messages } from "../../constants";
import path from "node:path";
import { Meta } from "../../controllers/Meta";
import { superUsers } from "../../ids.json";
import { AuthorOf } from "../../models/ExecutePermission";
import { BotCommand } from "../../types/BotCommand";

const Test: BotCommand = {
    name: "test",

    subcommands: new Map(),

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Test.name)
            .setDescription("This is a secret test command; shhh!")
            .addNumberOption(option => (
                option
                    .setName("frequency")
                    .setDescription(
                        "how frequently to do a thing"
                    )
                    .setRequired(true)
            ));

        // Test.subcommands.forEach((subcommand) => {
        //     serialization.addSubcommand(subcommand.serialize);
        // });

        return serialization;
    },

    canExecute: async (interaction) => {
        return AuthorOf(interaction).is(superUsers);
    },

    execute: async (interaction) => {
        // const subcommandName = interaction.options.getSubcommand();

        // const subcommand = Test.subcommands.get(subcommandName);

        // interaction.reply({
        //     content: `${
        //         interaction.guild?.bannerURL({
        //             forceStatic: true,
        //             size: 1024
        //         })
        //     }`,
        //     ephemeral: true
        // });

        if (Meta.testTimer !== null) {
            clearTimeout(Meta.testTimer);
        }

        if (interaction.options.getNumber("frequency") !== 0) {
            Meta.testTimer = setInterval(async () => {
                const test = await interaction.guild?.setBanner(
                    path.join(
                        __dirname,
                        `../../../banner${Meta.testBanner}.jpg`
                    )
                );
                console.log(test);
                Meta.testBanner = Meta.testBanner === 1 ? 2 : 1;
            }, interaction.options.getNumber("frequency") || 250);
        }

        interaction.reply({
            content: "Success",
            ephemeral: true
        });
        // try {
        //     await subcommand?.execute(interaction);
        // } catch (error) {
        //     console.log(error);
        //     await interaction.reply(messages.unknownError());
        // }
    }
};

export default Test;
