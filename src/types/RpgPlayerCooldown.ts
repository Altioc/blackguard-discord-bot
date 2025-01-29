export type RpgPlayerCooldown = {
    timer: NodeJS.Timeout;
    isActive: boolean;
    endTime: number;
};
