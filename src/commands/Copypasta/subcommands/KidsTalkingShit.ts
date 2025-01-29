import { BotSubcommand } from "../../../types/BotSubcommand";

export const KidsTalkingShit: BotSubcommand = {
    name: "kidstalkingshit",

    serialize: (subcommand) => {
        return subcommand
            .setName(KidsTalkingShit.name)
            .setDescription("i think its hilarious...")
            .addStringOption(option => (
                option
                    .setName("name")
                    .setDescription(
                        "The name of person the kids are talking shit about."
                    )
                    .setRequired(true)
            ));
    },

    execute: async (interaction) => {
        const { options } = interaction;
        const name = options.getString("name");

        await interaction.reply(`
i think its hilarious u kids talking shit about ${name}. u wouldnt say this shit to them at lan, they're jacked. not only that but ${name} wears the freshest clothes, eats at the chillest restaurants and hangs out with the hottest dudes. yall are pathetic lol
        `);
    }
};
