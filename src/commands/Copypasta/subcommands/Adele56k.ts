import { BotSubcommand } from "../../../types/BotSubcommand";

export const Adele56k: BotSubcommand = {
    name: "56kadele",

    serialize: (subcommand) => {
        return subcommand
            .setName(Adele56k.name)
            .setDescription("I know you're afraid of me...");
    },

    execute: async (interaction) => {
        await interaction.reply(`
I know you're afraid of me
catching up to you
It's not a big deal okay?
I'm alright.
no problem.
You don't want to marry me?
no problem either.,
How about you just duo with strizzle now too.
and do boss parties with him instead.
its fine.
i'm okay.
ill be okay.
it's cool.
it's kosher.
I don't care.
you think I care?
I really don't.
I'm a 56k adele.
I can find girls EASILY.
and I'm in excel.
so shut your :pinching_hand: sub 30k stat ass up. 
        `);
    }
};
