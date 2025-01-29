export type RpgJuggingConfig = {
    pvp: {
        successChance: number;
        counterChance: number;
        counterRewardFloor: number;
        counterRewardCeiling: number;
    };
    pve: {
        successChance: number;
        baseRewardFloor: number;
        baseRewardCeiling: number;
    };
    cooldownLength: number;
};
