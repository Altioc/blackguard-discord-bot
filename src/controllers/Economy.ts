import PouchDB from "pouchdb";
import PouchDBUpsert from "pouchdb-upsert";
PouchDB.plugin(PouchDBUpsert);

import {
    BlackguardDbDocName,
    CurrencyLocation,
    initialEconomyDoc,
    responseCodes
} from "../constants";
import { Wallet } from "../models/Wallet";
import { EconomyBank } from "../types/EconomyBank";
import { EconomyDocument } from "../types/EconomyDocument";
import { EconomyWithdrawl } from "../types/EconomyWithdrawl";
import { Response } from "../types/Response";
import { response } from "../utils/response";

class EconomyController {
    bank!: EconomyBank & {
        activeWithdrawals: Record<string, EconomyWithdrawl>;
    };
    currencyEmoji!: string;
    walletInitialCurrencyAmount!: number;
    bankInterestInterval?: NodeJS.Timeout;
    db: PouchDB.Database;

    constructor() {
        this.db = new PouchDB("BlackguardBotDb");
        this.db.putIfNotExists(initialEconomyDoc)
            .then(() => this.initConfig());
    }

    async resetDoc(): Promise<void> {
        await this.db.upsert(
            BlackguardDbDocName.Economy,
            () => initialEconomyDoc
        );
    }

    async initConfig(): Promise<void> {
        const doc = await this.db.get<EconomyDocument>(
            BlackguardDbDocName.Economy
        );

        const { bank, wallet, currencyEmoji } = doc.config;

        this.bank = {
            ...bank,
            activeWithdrawals: {}
        };
        this.currencyEmoji = currencyEmoji;
        this.walletInitialCurrencyAmount = wallet.initialCurrencyAmount;
        this.startInterestSystem();
    }

    startInterestSystem(): void {
        clearInterval(this.bankInterestInterval);
        this.bankInterestInterval = setInterval(async () => {
            await this.db.upsert<Partial<EconomyDocument>>(
                BlackguardDbDocName.Economy,
                (doc) => {
                    Object.entries(doc.wallets || {}).forEach(([userId]) => {
                        if (doc.wallets === undefined) {
                            doc.wallets = {};
                        }

                        doc.wallets[userId].bank = Math.floor(
                            doc.wallets[userId].bank
                                * (1 + this.bank.interestRate)
                        );
                    });

                    return doc;
                }
            );
        }, this.bank.interestTickRate);
    }

    async createWallet(userId: string): Promise<Response> {
        let responseCode = responseCodes.success;

        await this.db.upsert<Partial<EconomyDocument>>(
            BlackguardDbDocName.Economy,
            (doc) => {
                if (doc.wallets === undefined) {
                    doc.wallets = {};
                }

                if (!doc.wallets[userId]) {
                    doc.wallets[userId] = new Wallet(
                        this.walletInitialCurrencyAmount
                    );
                    responseCode = responseCodes.success;
                } else {
                    responseCode = responseCodes.alreadyExists;
                }

                return doc;
            }
        );

        return response(responseCode);
    }

    async getWallet(userId: string): Promise<Response> {
        const doc = await this.db.get<EconomyDocument>(
            BlackguardDbDocName.Economy
        );
        const responseCode = doc.wallets[userId]
            ? responseCodes.success
            : responseCodes.doesntExist;

        return response(responseCode, doc.wallets[userId]);
    }

    async getAllWallets(): Promise<Response> {
        const doc = await this.db.get<EconomyDocument>(
            BlackguardDbDocName.Economy
        );

        return response(responseCodes.success, doc.wallets);
    }

    async deleteWallet(userId: string): Promise<Response> {
        let responseCode = responseCodes.success;

        await this.db.upsert<Partial<EconomyDocument>>(
            BlackguardDbDocName.Economy,
            (doc) => {
                if (doc.wallets?.[userId]) {
                    delete doc.wallets[userId];
                    responseCode = responseCodes.success;
                } else {
                    responseCode = responseCodes.doesntExist;
                }

                return doc;
            }
        );

        return response(responseCode);
    }

    async transferCurrency(
        fromUserId: string,
        toUserId: string,
        value: number
    ): Promise<Response> {
        let responseCode = responseCodes.success;

        if (value <= 0) {
            return response(responseCodes.positiveValueNeeded);
        }

        if (fromUserId === toUserId) {
            return response(responseCodes.economy.sameUser);
        }

        await this.db.upsert<Partial<EconomyDocument>>(
            BlackguardDbDocName.Economy,
            (doc) => {
                if (doc.wallets === undefined) {
                    doc.wallets = {};
                }

                const fromUserWallet = doc.wallets[fromUserId];
                const toUserWallet = doc.wallets[toUserId];

                if (!fromUserWallet) {
                    responseCode = responseCodes.economy.noFromUser;
                } else if (!toUserWallet) {
                    responseCode = responseCodes.economy.noToUser;
                } else if (fromUserWallet.value - value < 0) {
                    responseCode = responseCodes.economy.insufficientFunds;
                } else {
                    fromUserWallet.value -= +value;
                    toUserWallet.value += +value;
                }

                return doc;
            }
        );

        return response(responseCode);
    }

    async withdrawCurrency(
        targetUserId: string,
        amount: number | null
    ): Promise<Response> {
        const existingWithdrawal = this.bank.activeWithdrawals[targetUserId];

        if (amount === null) {
            if (existingWithdrawal?.isActive) {
                return response(
                    responseCodes.economy.bank.existingWithdrawal,
                    existingWithdrawal
                );
            } else {
                return response(
                    responseCodes.economy.bank.noExistingWithdrawal
                );
            }
        }

        if (amount <= 0) {
            return response(responseCodes.positiveValueNeeded);
        }

        const doc = await this.db.get<EconomyDocument>(
            BlackguardDbDocName.Economy
        );

        const wallet = doc.wallets[targetUserId];

        if (!wallet) {
            return response(responseCodes.doesntExist);
        } else if (wallet.bank - amount < 0) {
            return response(responseCodes.economy.insufficientFunds);
        } else if (existingWithdrawal?.isActive) {
            const oldAmount = this.bank.activeWithdrawals[targetUserId].amount;
            this.bank.activeWithdrawals[targetUserId].amount = amount;
            return response(
                responseCodes.economy.bank.withdrawalAmountUpdated,
                oldAmount
            );
        } else {
            const withdrawalTime = Date.now()
                + this.bank.withdrawalTime;
            this.bank.activeWithdrawals[targetUserId] = {
                amount,
                withdrawalTime,
                isActive: true,
                timer: setTimeout(() => {
                    const thisWithdrawalAttempt =
                        this.bank.activeWithdrawals[targetUserId];
                    const amountToWithdrawal = thisWithdrawalAttempt.amount;
                    thisWithdrawalAttempt.isActive = false;
                    this.commitWithdrawal(
                        targetUserId,
                        amountToWithdrawal
                    );
                }, this.bank.withdrawalTime)
            };

            return response(responseCodes.success, withdrawalTime);
        }
    }

    async commitWithdrawal(
        targetUserId: string,
        amount: number
    ): Promise<void> {
        await this.db.upsert<Partial<EconomyDocument>>(
            BlackguardDbDocName.Economy,
            (doc) => {
                if (doc.wallets === undefined) {
                    doc.wallets = {};
                }

                const wallet = doc.wallets[targetUserId];

                if (!wallet) {
                    return doc;
                }

                const expectedBankValue = wallet.bank - amount;

                if (expectedBankValue >= 0) {
                    doc.wallets[targetUserId].bank -= amount;
                    doc.wallets[targetUserId].value += amount;
                }

                return doc;
            }
        );
    }

    async depositCurrency(
        targetUserId: string,
        initialAmount: string
    ): Promise<Response> {
        if (+initialAmount <= 0) {
            return response(responseCodes.positiveValueNeeded);
        }

        if (
            initialAmount.toLowerCase() !== "max" && isNaN(+initialAmount)
        ) {
            return response(responseCodes.invalidInput);
        }

        let result!: Response;

        await this.db.upsert<Partial<EconomyDocument>>(
            BlackguardDbDocName.Economy,
            (doc) => {
                if (doc.wallets === undefined) {
                    doc.wallets = {};
                }

                const wallet = doc.wallets[targetUserId];

                if (!wallet) {
                    result = response(responseCodes.doesntExist);
                } else {
                    const totalTargetValue = wallet.value + wallet.bank;
                    const highestAllowedDepositValue = Math.round(
                        totalTargetValue * this.bank.storableValueRatio
                    );

                    let amount = +initialAmount;

                    if (initialAmount.toLowerCase() === "max") {
                        amount = Math.max(
                            0,
                            wallet.value - highestAllowedDepositValue
                        );
                    }

                    if (wallet.value === 0 || wallet.value - amount < 0) {
                        result = response(
                            responseCodes.economy.insufficientFunds
                        );
                    } else if (
                        wallet.bank + amount > highestAllowedDepositValue
                    ) {
                        result = response(
                            responseCodes.valueTooHigh,
                            highestAllowedDepositValue
                        );
                    } else {
                        doc.wallets[targetUserId].value -= +amount;
                        doc.wallets[targetUserId].bank += +amount;
                        result = response(responseCodes.success, amount);
                    }
                }

                return doc;
            }
        );

        return result;
    }

    async modifyCurrency(
        targetUserId: string,
        amount: number,
        location = CurrencyLocation.Wallet
    ): Promise<Response> {
        let newValue;

        const doc = await this.db.get<EconomyDocument>(
            BlackguardDbDocName.Economy
        );

        if (!doc.wallets[targetUserId]) {
            return response(responseCodes.userDoesNotExist);
        }

        await this.db.upsert<Partial<EconomyDocument>>(
            BlackguardDbDocName.Economy,
            (doc) => {
                if (doc.wallets === undefined) {
                    doc.wallets = {};
                }

                doc.wallets[targetUserId][location] += amount;

                if (doc.wallets[targetUserId][location] < 0) {
                    doc.wallets[targetUserId][location] = 0;
                }

                newValue = doc.wallets[targetUserId][location];
                return doc;
            }
        );

        return response(
            responseCodes.success,
            newValue
        );
    }

    async bulkModifyCurrency(
        modifications: { userId: string; value: number; }[]
    ): Promise<Response> {
        await this.db.upsert<Partial<EconomyDocument>>(
            BlackguardDbDocName.Economy,
            (doc) => {
                modifications.forEach((modification) => {
                    const { userId, value } = modification;

                    if (doc.wallets === undefined) {
                        doc.wallets = {};
                    }

                    doc.wallets[userId].value += +value;

                    if (doc.wallets[userId].value < 0) {
                        doc.wallets[userId].value = 0;
                    }
                });

                return doc;
            }
        );

        return response(responseCodes.success);
    }
}

export const Economy = new EconomyController();
