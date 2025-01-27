import PouchDB from "pouchdb";
import PouchDBUpsert from "pouchdb-upsert";
PouchDB.plugin(PouchDBUpsert);

import { BlackguardDbDocName, initialMetaDoc } from "../constants";
import { IntroductionAutomator } from "../models/IntroductionAutomator";
import { MetaDocument } from "../types/MetaDocument";

class MetaController {
    botId!: string;
    introductionAutomator!: IntroductionAutomator;
    db: PouchDB.Database;

    constructor() {
        this.db = new PouchDB("BlackguardBotDb");
        this.db.putIfNotExists(initialMetaDoc)
            .then(this.loadGuildDoc);
    }

    setBotId(newId: string): void {
        this.botId = newId;
    }

    async resetDoc(): Promise<void> {
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            () => initialMetaDoc
        );
    }

    async loadGuildDoc(): Promise<void> {
        const doc = await this.db.get<MetaDocument>(BlackguardDbDocName.Meta);

        this.introductionAutomator = new IntroductionAutomator(
            this.db,
            doc.introductionAutomator
        );
    }
}

export const Meta = new MetaController();
