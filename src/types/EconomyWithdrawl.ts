export type EconomyWithdrawl = {
    amount: number;
    withdrawalTime: number;
    isActive: boolean;
    timer: NodeJS.Timer;
};
