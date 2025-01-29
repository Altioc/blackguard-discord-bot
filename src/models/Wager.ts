import { WagerConstructorParameters } from "../types/WagerConstructorParameters";
import { WagerResult } from "../types/WagerResult";
import { Bet } from "./Bet";

export class Wager {
    ownerId: string;
    premise: string;
    isOpen: boolean;
    bets: Bet[];
    isActive: boolean;

    constructor(
        { ownerId, premise, bets, isActive, isOpen }: WagerConstructorParameters
    ) {
        this.ownerId = ownerId;
        this.premise = premise;
        this.isOpen = isOpen;
        this.bets = bets ? bets.map(bet => new Bet(bet)) : [];
        this.isActive = isActive === undefined ? true : isActive;
    }

    end() {
        this.setOpen(false);
        this.isActive = false;
    }

    setOpen(newOpenState: boolean) {
        this.isOpen = newOpenState;
    }

    add(bet: Bet) {
        if (this.isOpen) {
            this.bets.push(bet);
        }
    }

    getResults(outcome: string): WagerResult {
        const { totalWinnings, totalLosings } = this.bets.reduce(
            (results, bet) => {
                if (bet.option === outcome) {
                    results.totalWinnings += bet.value;
                } else {
                    results.totalLosings += bet.value;
                }

                return results;
            },
            { totalWinnings: 0, totalLosings: 0 }
        );

        return this.bets.reduce((results: WagerResult, bet) => {
            if (bet.option === outcome) {
                const winnings = Math.floor(
                    (bet.value / totalWinnings) * totalLosings
                );
                results.winners.push({
                    userId: bet.ownerId,
                    value: Math.floor(winnings + bet.value),
                    net: `+${winnings}`
                });
            } else {
                results.losers.push({
                    userId: bet.ownerId,
                    value: bet.value,
                    net: `-${bet.value}`
                });
            }

            return results;
        }, { winners: [], losers: [] });
    }

    toJsonCompatibleObject(): WagerConstructorParameters {
        return {
            ownerId: this.ownerId,
            premise: this.premise,
            bets: this.bets.map(bet => bet.toJsonCompatibleObject()),
            isActive: this.isActive,
            isOpen: this.isOpen
        };
    }
}
