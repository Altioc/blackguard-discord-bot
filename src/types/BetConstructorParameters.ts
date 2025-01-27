import { BetOption } from "../constants";

export type BetConstructorParameters = {
    value: number;
    option: BetOption;
    ownerId: string;
};
