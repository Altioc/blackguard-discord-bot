import PouchDB from "pouchdb";
import PouchDBUpsert from "pouchdb-upsert";
PouchDB.plugin(PouchDBUpsert);

import assert from "node:assert";
import {
    BetOption,
    BlackguardDbDocName,
    initialBookDoc,
    responseCodes
} from "../constants";
import { Economy } from "../controllers/Economy";
import { Bet } from "../models/Bet";
import { Wager } from "../models/Wager";
import { BookDocument } from "../types/BookDocument";
import { Response } from "../types/Response";
import { WagerResult } from "../types/WagerResult";
import { response } from "../utils/response";

class BooksController {
    latestWager: Wager | null = null;
    wagerTimeoutMs!: number;
    wagerTimeout?: NodeJS.Timeout;
    db: PouchDB.Database;

    constructor() {
        this.db = new PouchDB("BlackguardBotDb");
        this.db.putIfNotExists(initialBookDoc)
            .then(() => this.initConfig())
            .then(() => this.initLatestWager());
    }

    async resetDoc(): Promise<void> {
        await this.db.upsert(
            BlackguardDbDocName.Books,
            () => initialBookDoc
        );
    }

    async initLatestWager(): Promise<void> {
        const doc = await this.db.get<BookDocument>(
            BlackguardDbDocName.Books
        );

        if (doc.latestWager) {
            this.latestWager = new Wager(doc.latestWager);
            this.startLatestWagerTimeout();
        }
    }

    async initConfig(): Promise<void> {
        const doc = await this.db.get<BookDocument>(
            BlackguardDbDocName.Books
        );
        this.wagerTimeoutMs = doc.config.wagerTimeoutMs;
    }

    startLatestWagerTimeout(): void {
        this.wagerTimeout = setTimeout(async () => {
            if (!this.latestWager) {
                return;
            }

            await this.endWager();
            await this.rollBackBets();
        }, this.wagerTimeoutMs);
    }

    async bet(
        ownerId: string,
        value: number | "all",
        option: BetOption
    ): Promise<Response> {
        const newBet = new Bet({ value: 0, option, ownerId });

        if (!this.wagerIsValid()) {
            return response(responseCodes.book.noActiveWager);
        }

        assert(this.latestWager !== null);

        if (!this.latestWager.isOpen) {
            return response(responseCodes.book.noOpenWager);
        }

        if (this.latestWager.ownerId === ownerId) {
            return response(responseCodes.book.ownWager);
        }

        const { value: wallet } = await Economy.getWallet(ownerId);

        if (!wallet) {
            return response(responseCodes.doesntExist);
        }

        if (value === "all") {
            newBet.value = wallet.value;
        } else {
            newBet.value = value;
        }

        if (wallet.value < newBet.value) {
            return response(
                responseCodes.economy.insufficientFunds
            );
        }

        const existingBetId = this.latestWager.bets.findIndex(bet =>
            bet.ownerId === ownerId
        );

        if (existingBetId >= 0) {
            return response(responseCodes.alreadyExists);
        }

        this.latestWager.add(newBet);

        await Economy.modifyCurrency(ownerId, -value);
        await this.saveWager();

        return response(
            responseCodes.success,
            newBet.value
        );
    }

    async startWager(ownerId: string, premise: string): Promise<Response> {
        if (!this.wagerIsValid()) {
            return response(responseCodes.book.activeWagerAlreadyExists);
        }

        this.latestWager = new Wager({ ownerId, premise, isOpen: true });
        await this.saveWager();
        this.startLatestWagerTimeout();

        return response(responseCodes.success);
    }

    async setWagerOpenState(openState: boolean): Promise<Response> {
        if (!this.wagerIsValid()) {
            return response(responseCodes.book.noActiveWager);
        }

        if (
            this.latestWager !== null && this.latestWager.isOpen !== openState
        ) {
            this.latestWager.setOpen(openState);
            return this.saveWager();
        }

        return response(responseCodes.book.setWagerOpenState.wrongState);
    }

    async endWager(): Promise<Response> {
        if (this.wagerIsValid()) {
            this.latestWager?.end();
            return this.saveWager();
        }

        return response(responseCodes.book.noActiveWager);
    }

    async distributePayout(outcome: string): Promise<Response<WagerResult>> {
        if (!this.latestWager) {
            return response(responseCodes.book.noActiveWager);
        }

        const results = this.latestWager.getResults(outcome);

        if (results.winners.length === 0) {
            return response(responseCodes.book.distributePayout.noWinners);
        }

        await Economy.bulkModifyCurrency(results.winners);

        return response(
            responseCodes.success,
            results
        );
    }

    async rollBackBets(): Promise<Response> {
        assert(this.latestWager !== null);

        const wagerParticipants = this.latestWager.bets.map((bet) => {
            return { userId: bet.ownerId, value: bet.value };
        });

        if (wagerParticipants.length === 0) {
            return response(responseCodes.book.rollback.noParticipants);
        }

        const { responseCode } = await Economy.bulkModifyCurrency(
            wagerParticipants
        );

        return response(responseCode);
    }

    async saveWager(): Promise<Response> {
        await this.db.upsert<Partial<BookDocument>>(
            BlackguardDbDocName.Books,
            (doc) => {
                assert(this.latestWager !== null);

                doc.latestWager = this.latestWager.toJsonCompatibleObject();
                return doc;
            }
        );

        return response(responseCodes.success);
    }

    private wagerIsValid(): boolean {
        return this.latestWager !== null && this.latestWager.isActive;
    }
}

export const Books = new BooksController();
