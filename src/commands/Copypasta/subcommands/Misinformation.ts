import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from "discord.js";

export const Misinformation = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) => (
        subcommand
            .setName("misinformation")
            .setDescription(
                "Please stop using the forums to spread misinformation..."
            )
    ),

    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply(`
Please stop using the forums to spread misinformation. Thank you. Just based on your comments you seem to enjoy engaging in arguing with others even when you are in the wrong. So I'll stop here.
        `);
    }
};
