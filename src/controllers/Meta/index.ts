import PouchDB from "pouchdb";
import PouchDBUpsert from "pouchdb-upsert";
PouchDB.plugin(PouchDBUpsert);

import { Client } from "discord.js";
import assert from "node:assert";
import { BlackguardDbDocName, initialMetaDoc } from "../../constants";
import { IntroductionAutomator } from "../../controllers/Meta/IntroductionAutomator";
import { MetaDocument } from "../../types/MetaDocument";

class MetaController {
    client!: Client;
    botId!: string;
    introductionAutomator!: IntroductionAutomator;
    memberRoles = new Set<string>();
    rejectedRole: string | null = null;
    db: PouchDB.Database;

    constructor() {
        this.db = new PouchDB("BlackguardBotDb");
        this.db.putIfNotExists(initialMetaDoc)
            .then(() => this.loadGuildDoc());
    }

    setClient(client: Client): void {
        assert(client.user !== null);

        this.botId = client.user.id;
        this.client = client;
    }

    async setRejectedRole(roleId: string | null): Promise<void> {
        this.rejectedRole = roleId;
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    rejectedRole: this.rejectedRole
                };
            }
        );
    }

    async addMemberRole(roleId: string): Promise<void> {
        this.memberRoles.add(roleId);
        await this.updateMemberRoles();
    }

    async removeMemberRole(roleId: string): Promise<void> {
        this.memberRoles.delete(roleId);
        await this.updateMemberRoles();
    }

    async updateMemberRoles(): Promise<void> {
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    memberRoles: Array.from(this.memberRoles)
                };
            }
        );
    }

    async resetDoc(): Promise<void> {
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            () => initialMetaDoc
        );
    }

    async loadGuildDoc(): Promise<void> {
        const doc = await this.db.get<MetaDocument>(BlackguardDbDocName.Meta);

        this.rejectedRole = doc.rejectedRole;

        this.memberRoles = new Set(doc.memberRoles);

        this.introductionAutomator = new IntroductionAutomator(
            this.db,
            doc.introductionAutomator
        );
    }
}

export const Meta = new MetaController();
