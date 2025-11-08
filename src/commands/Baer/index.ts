import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs/promises";
import path from "node:path";
import { messages } from "../../constants";
import { AuthorOf, Or } from "../../models/ExecutePermission";
import { BotCommandWithoutSubcommands } from "../../types/WithoutSubcommands";

export const baerImagesPath = path.join(
    __dirname,
    "../../../../../blkgrdbot-assets/baer"
);

export const Baer: BotCommandWithoutSubcommands = {
    name: "baer",

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Baer.name)
            .setDescription("Send a random image of the Baer SCP");

        return serialization;
    },

    canExecute: async (interaction) => {
        return Or(
            AuthorOf(interaction).has("blackguard"),
            AuthorOf(interaction).has("guest")
        );
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        try {
            await fs.access(baerImagesPath, fs.constants.R_OK);

            const allImages = await fs.readdir(baerImagesPath);

            const randomImageIndex = Math.floor(
                Math.random() * allImages.length
            );

            const imageName = allImages[randomImageIndex];

            interaction.editReply({
                files: [{
                    attachment: path.join(baerImagesPath, imageName),
                    name: imageName
                }]
            });
        } catch (error) {
            console.log(
                error,
                "Baer.execute()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};

export default Baer;
