import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import fs from "node:fs/promises";
import path from "node:path";
import { messages } from "../../constants";
import { BotCommandWithoutSubcommands } from "../../types/WithoutSubcommands";

export const baerImagesPath = path.join(
    __dirname,
    "../../../../../blkgrdbot-assets/baer"
);

export const rareBaerImagesPath = path.join(
    __dirname,
    "../../../../../blkgrdbot-assets/rarebaer"
);

export const Baer: BotCommandWithoutSubcommands = {
    name: "baer",

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Baer.name)
            .setDescription("Send a random image of the Baer SCP")
            .setDefaultMemberPermissions(0)
            .setContexts(InteractionContextType.Guild);

        return serialization;
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        try {
            await fs.access(baerImagesPath, fs.constants.R_OK);
            await fs.access(rareBaerImagesPath, fs.constants.R_OK);

            const isRare = Math.random() <= 0.05;

            const imagesPath = isRare ? rareBaerImagesPath : baerImagesPath;

            const allImages = await fs.readdir(imagesPath);

            const randomImageIndex = Math.floor(
                Math.random() * allImages.length
            );

            const imageName = allImages[randomImageIndex];

            interaction.editReply({
                files: [{
                    attachment: path.join(imagesPath, imageName),
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
