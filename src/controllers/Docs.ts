import PouchDB from "pouchdb";
import PouchDBUpsert from "pouchdb-upsert";
PouchDB.plugin(PouchDBUpsert);

import { BlackguardDbDocName, responseCodes } from "../constants";
import { MinimumDocument } from "../types/MinimumDocument";
import { Response } from "../types/Response";
import { response } from "../utils/response";
import { Books } from "./Books";
import { Economy } from "./Economy";
import { Rpg } from "./Rpg";

class DocsController {
    db: PouchDB.Database;

    constructor() {
        this.db = new PouchDB("BlackguardBotDb");
    }

    async getDoc(
        docNameKey: keyof typeof BlackguardDbDocName,
        configOnly: boolean
    ): Promise<Response> {
        const doc = await this.db.get<MinimumDocument>(
            BlackguardDbDocName[docNameKey]
        );
        if (configOnly) {
            return response(
                responseCodes.success,
                JSON.stringify(doc.config || {}, null, "  ")
            );
        }

        return response(
            responseCodes.success,
            JSON.stringify(doc, null, "  ")
        );
    }

    async setDoc(
        docNameKey: keyof typeof BlackguardDbDocName,
        value: object,
        configOnly: boolean
    ): Promise<Response> {
        if (typeof value !== "object") {
            return response(responseCodes.config.setConfig.invalidJSON);
        }

        await this.db.upsert<Partial<MinimumDocument>>(
            BlackguardDbDocName[docNameKey],
            (doc) => {
                if (configOnly) {
                    doc.config = value;
                } else {
                    if ("_rev" in value) {
                        delete value._rev;
                    }

                    if ("_id" in value) {
                        delete value._id;
                    }

                    doc = {
                        ...doc,
                        ...value
                    };
                }

                return doc;
            }
        );

        switch (BlackguardDbDocName[docNameKey]) {
            case BlackguardDbDocName.Books:
                Books.initConfig();
                break;
            case BlackguardDbDocName.Economy:
                Economy.initConfig();
                break;
            case BlackguardDbDocName.Rpg:
                Rpg.loadCharacters();
                break;
        }

        return response(responseCodes.success);
    }

    async resetDoc(
        docNameKey: keyof typeof BlackguardDbDocName
    ): Promise<Response> {
        switch (BlackguardDbDocName[docNameKey]) {
            case BlackguardDbDocName.Economy: {
                await Economy.resetDoc();
                await Economy.initConfig();
                return response(responseCodes.success);
            }
            case BlackguardDbDocName.Books: {
                await Books.resetDoc();
                await Books.initConfig();
                return response(responseCodes.success);
            }
            case BlackguardDbDocName.Rpg: {
                await Rpg.resetDoc();
                await Rpg.loadCharacters();
                return response(responseCodes.success);
            }
        }

        return response(responseCodes.failure);
    }
}

export const Docs = new DocsController();
