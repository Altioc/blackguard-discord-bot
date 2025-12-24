import {
    AttachmentBuilder,
    EmbedBuilder,
    InteractionContextType,
    SlashCommandBuilder
} from "discord.js";
import fs from "node:fs/promises";
import path from "node:path";
import { messages } from "../../constants";
import { Meta } from "../../controllers/Meta";
import { BotCommandWithoutSubcommands } from "../../types/WithoutSubcommands";

export const baerImagesPath = path.join(
    __dirname,
    "../../../../../blkgrdbot-assets/baer"
);

export const rareBaerImagesPath = path.join(
    __dirname,
    "../../../../../blkgrdbot-assets/rarebaer"
);

const RareBaerChance = 0.05;
const LukeRareBaerName = "rarebaer2.png";
const RareLukeFollowUpName = "rarebaer3.png";
const RareLukeFollowUpChance = 0.5;

export const Baer: BotCommandWithoutSubcommands = {
    name: "baer",

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Baer.name)
            .setDescription("Send a random Baer image")
            .setDefaultMemberPermissions(0)
            .setContexts(InteractionContextType.Guild);

        return serialization;
    },

    execute: async (interaction) => {
        await interaction.deferReply();

        try {
            await fs.access(baerImagesPath, fs.constants.R_OK);
            await fs.access(rareBaerImagesPath, fs.constants.R_OK);

            let isRare = Math.random() <= RareBaerChance;

            const imagesPath = isRare ? rareBaerImagesPath : baerImagesPath;

            const allImages = await fs.readdir(imagesPath);

            let randomImageIndex = Math.floor(
                Math.random() * allImages.length
            );

            let imageName = allImages[randomImageIndex];

            if (Meta.previousBaer === LukeRareBaerName) {
                const followUp = Math.random() <= RareLukeFollowUpChance;
                if (followUp) {
                    imageName = RareLukeFollowUpName;
                    isRare = true;
                }
            }

            Meta.previousBaer = imageName;

            if (isRare) {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(
                                "<a:siren:1453516501423493261> RAERBAER <a:siren:1453516501423493261>"
                            )
                            .setImage(`attachment://${imageName}`)
                            .setColor("#f9b606")
                    ],
                    files: [
                        new AttachmentBuilder(
                            path.join(imagesPath, imageName)
                        )
                    ]
                });
            } else {
                interaction.editReply({
                    files: [{
                        attachment: path.join(imagesPath, imageName),
                        name: imageName
                    }]
                });
            }
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
