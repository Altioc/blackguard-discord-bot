import { BlackguardDbDocName } from "../constants";
import { Wallet } from "../models/Wallet";
import { EconomyBank } from "./EconomyBank";
import { MinimumDocument } from "./MinimumDocument";

export type EconomyDocument = MinimumDocument & {
    _id: BlackguardDbDocName.Economy;
    wallets: Record<string, Wallet>;
    config: {
        currencyEmoji: string;
        bank: EconomyBank;
        wallet: {
            initialCurrencyAmount: number;
        };
    };
};
