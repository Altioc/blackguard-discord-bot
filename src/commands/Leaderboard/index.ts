import {
    codeBlock,
    EmbedBuilder,
    GuildMember,
    SlashCommandBuilder
} from "discord.js";
import assert from "node:assert";
import {
    LeaderboardType,
    messages,
    messageTypeColors,
    responseCodes
} from "../../constants";
import { Economy } from "../../controllers/Economy";
import { Rpg } from "../../controllers/Rpg";
import { Character } from "../../models/Character";
import { AuthorOf, Or } from "../../models/ExecutePermission";
import { Wallet } from "../../models/Wallet";
import { LeaderboardExtreme } from "../../types/LeaderboardExtreme";
import { BotCommandWithoutSubcommands } from "../../types/WithoutSubcommands";
import { capitalize } from "../../utils/capitalize";

const leaderboardRankEmoji = ["🥇", "🥈", "🥉"];

export const Leaderboard: BotCommandWithoutSubcommands = {
    name: "leaderboard",

    serialize: () => {
        const serialization = new SlashCommandBuilder()
            .setName(Leaderboard.name)
            .setDescription("Prints the current Bilaim wallet leaderboard.")
            .addStringOption((option) => (
                option
                    .setName("type")
                    .setDescription(
                        "What leaderboard type to show. Defaults to wealth"
                    )
                    .addChoices(
                        { name: "Power", value: LeaderboardType.Power },
                        { name: "Wealth", value: LeaderboardType.Wealth }
                    )
            ));

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
        const type = interaction.options.getString("type")
            || LeaderboardType.Wealth;

        try {
            const { responseCode, value: wallets } = await Economy
                .getAllWallets();

            switch (responseCode) {
                case responseCodes.success: {
                    let leaderboard;

                    switch (type) {
                        case LeaderboardType.Wealth: {
                            const sortedWealthUsers = sortWalletsByWealth(
                                wallets,
                                25
                            );

                            const users = await Promise.all(
                                sortedWealthUsers.map((wallet) => {
                                    const [userId] = wallet;

                                    assert(interaction.guild !== null);

                                    return interaction.guild.members.fetch(
                                        userId
                                    );
                                })
                            );

                            leaderboard = await buildWealthLeaderboardText(
                                users,
                                sortedWealthUsers
                            );
                            break;
                        }
                        case LeaderboardType.Power: {
                            const sortedCharacters =
                                await sortCharactersByPower(
                                    Object.keys(wallets),
                                    25
                                );

                            const users = await Promise.all(
                                sortedCharacters.map((character) => {
                                    const { ownerId } = character;

                                    assert(interaction.guild !== null);

                                    return interaction.guild.members.fetch(
                                        ownerId
                                    );
                                })
                            );

                            leaderboard = await buildPowerLeaderboardText(
                                users,
                                sortedCharacters
                            );
                            break;
                        }
                    }

                    assert(leaderboard !== undefined);

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    `${capitalize(type)} Bilaim Leaderboard`
                                )
                                .setColor(messageTypeColors.Success)
                                .setDescription(
                                    codeBlock(leaderboard)
                                )
                        ]
                    });
                    break;
                }
                default: {
                    interaction.editReply(messages.unknownError());
                }
            }
        } catch (error) {
            console.log(
                error,
                "Leaderboard.execute() -> Economy.getAllWallets()"
            );
            interaction.editReply(messages.unknownError());
        }
    }
};

const sortWalletsByWealth = (
    wallets: Wallet[],
    limit: number
): [string, Wallet][] => {
    return Object.entries(wallets)
        .sort((
            [_, { value: valueA, bank: bankA }],
            [__, { value: valueB, bank: bankB }]
        ) => {
            return (valueB + bankB) - (valueA + bankA);
        })
        .slice(0, limit);
};

const sortCharactersByPower = async (
    userIds: string[],
    limit: number
): Promise<Character[]> => {
    const characters = await Promise.all(
        userIds.map((id) => (
            Rpg.getCharacter(id)
        ))
    );

    return characters
        .sort((characterA, characterB) => {
            const { armor: armorA, weapon: weaponA } =
                characterA.equipmentLevels;
            const { armor: armorB, weapon: weaponB } =
                characterB.equipmentLevels;
            return (armorB + weaponB) - (armorA + weaponA);
        })
        .slice(0, limit);
};

const getOrdinalSuffix = (num: number): string => {
    const value = `${num}`;

    if (value.endsWith("11") || value.endsWith("12") || value.endsWith("13")) {
        return "th";
    }

    if (value.endsWith("1")) {
        return "st";
    }

    if (value.endsWith("2")) {
        return "nd";
    }

    if (value.endsWith("3")) {
        return "rd";
    }

    return "th";
};

const buildWealthLeaderboardText = async (
    users: GuildMember[],
    wallets: [string, Wallet][]
): Promise<string> => {
    let leaderboardText = "";

    if (users.length > 0) {
        const userDataExtremes = users.reduce(
            (extremes: LeaderboardExtreme, _, index: number) => {
                const wallet = wallets[index][1];

                const walletValue = `${wallet.value}`;
                if (walletValue.length > extremes.walletValueLength) {
                    extremes.walletValueLength = walletValue.length;
                }

                const splitValue = `${wallet.value}${wallet.bank}`;
                if (splitValue.length > extremes.splitValueLength) {
                    extremes.splitValueLength = splitValue.length;
                }

                const combinedValue = `${wallet.value + wallet.bank}`;
                if (combinedValue.length > extremes.combinedValueLength) {
                    extremes.combinedValueLength = combinedValue.length;
                }

                return extremes;
            },
            {
                splitValueLength: 0,
                combinedValueLength: 0,
                walletValueLength: 0
            }
        );

        const leaderboardTextParts = [];
        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            const wallet = wallets[index][1];
            const walletValue = wallet.value;
            const bankValue = wallet.bank;
            const walletValueDisplay = `${walletValue}`.padEnd(
                userDataExtremes.walletValueLength,
                " "
            );
            const totalBilaimCount = `${walletValue + bankValue}`.padEnd(
                userDataExtremes.combinedValueLength,
                " "
            );
            const splitValuesDisplay =
                `(💵${walletValueDisplay} / 🏛️${bankValue}) `.padEnd(
                    userDataExtremes.splitValueLength + 13,
                    "-"
                );
            const rank = index + 1;
            const rankOrdinalSuffix = getOrdinalSuffix(rank);
            const rankDisplay = `${rank}${rankOrdinalSuffix}`.padStart(4, " ");
            const rankIndicator = leaderboardRankEmoji[index] || "⬛";
            leaderboardTextParts.push(
                `󠀠󠀠${rankIndicator} ${rankDisplay}  ${totalBilaimCount} ${splitValuesDisplay} ${user.displayName}`
            );
        }

        leaderboardText = leaderboardTextParts.join("\n");
    } else {
        leaderboardText = "There is nobody to place on the leaderboard.";
    }

    return leaderboardText;
};

const buildPowerLeaderboardText = async (
    users: GuildMember[],
    characters: Character[]
): Promise<string> => {
    let leaderboardText = "";

    if (users.length > 0) {
        const userDataExtremes = users.reduce((extremes, _, index) => {
            const character = characters[index];
            const { armor, weapon } = character.equipmentLevels;

            const weaponValue = `${weapon}`;
            if (weaponValue.length > extremes.weaponValueLength) {
                extremes.weaponValueLength = weaponValue.length;
            }

            const splitValue = `${armor}${weapon}`;
            if (splitValue.length > extremes.splitValueLength) {
                extremes.splitValueLength = splitValue.length;
            }

            const combinedValue = `${armor + weapon}`;
            if (combinedValue.length > extremes.combinedValueLength) {
                extremes.combinedValueLength = combinedValue.length;
            }

            return extremes;
        }, {
            splitValueLength: 0,
            combinedValueLength: 0,
            weaponValueLength: 0
        });

        const leaderboardTextParts = [];
        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            const rank = index + 1;
            const rankOrdinalSuffix = getOrdinalSuffix(rank);
            const rankDisplay = `${rank}${rankOrdinalSuffix}`.padStart(4, " ");
            const rankIndicator = leaderboardRankEmoji[index] || "⬛";
            const character = await Rpg.getCharacter(user.id);
            const { weapon, armor } = character.equipmentLevels;
            const totalLevels = `${weapon + armor}`.padEnd(
                userDataExtremes.combinedValueLength,
                " "
            );
            const weaponValueDisplay = `${weapon}`.padEnd(
                userDataExtremes.weaponValueLength,
                " "
            );
            const splitValuesDisplay = `(⚔️${weaponValueDisplay} / 🛡️${armor}) `
                .padEnd(userDataExtremes.splitValueLength + 13, "-");
            leaderboardTextParts.push(
                `󠀠󠀠${rankIndicator} ${rankDisplay}  ${totalLevels} ${splitValuesDisplay} ${user.displayName}`
            );
        }

        leaderboardText = leaderboardTextParts.join("\n");
    } else {
        leaderboardText = "There is nobody to place on the leaderboard.";
    }

    return leaderboardText;
};

export default Leaderboard;
