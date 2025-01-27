import { BetConstructorParameters } from "./BetConstructorParameters";

export type WagerConstructorParameters = {
    ownerId: string;
    premise: string;
    bets?: BetConstructorParameters[];
    isActive?: boolean;
    isOpen: boolean;
};
