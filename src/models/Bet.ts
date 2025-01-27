import { BetOption } from "../constants";
import { BetConstructorParameters } from "../types/BetConstructorParameters";

export class Bet {
    value: number;
    option: BetOption;
    ownerId: string;

    constructor({ value, option, ownerId }: BetConstructorParameters) {
        this.value = +value;
        this.option = option;
        this.ownerId = ownerId;
    }

    toJsonCompatibleObject(): BetConstructorParameters {
        return {
            value: this.value,
            option: this.option,
            ownerId: this.ownerId
        };
    }
}
