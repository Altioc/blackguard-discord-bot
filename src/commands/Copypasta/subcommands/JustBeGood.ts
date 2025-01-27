import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    TextChannel
} from "discord.js";
import assert from "node:assert";

export const JustBeGood = {
    subCommandData: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand
            .setName("justbegood")
            .setDescription("interesting :hmmge: just be good..."),

    async execute(interaction: ChatInputCommandInteraction) {
        assert(interaction.guild !== null);

        const channel = await interaction.guild.channels.fetch(
            interaction.channelId
        );

        const hmmletEmoji = interaction.guild.emojis.cache.find((emoji) => {
            return emoji.name === "hmmlet";
        });

        let emoji = "🤔";

        if (hmmletEmoji) {
            emoji = `<:hmmlet:${hmmletEmoji.id}>`;
        }

        await interaction.reply(`
interesting
        `);

        assert(channel !== null);
        assert(channel instanceof TextChannel);

        await channel.send(emoji);

        await channel.send(`
just be good at the game instead of bad
it's not hard
        `);
    }
};
