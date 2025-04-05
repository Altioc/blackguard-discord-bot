import { BlackguardDbDocName } from "../../constants";
import { Introduction } from "../../models/Introduction";
import { MetaDocument } from "../../types/MetaDocument";
import { MetaIntroductionAutomator } from "../../types/MetaIntroductionAutomator";

export class IntroductionAutomator {
    introductionButtonChannelId: string | null = null;
    introductionButtonMessageId: string | null = null;
    screeningChannelId: string | null = null;
    introductions: Introduction[] = [];
    db: PouchDB.Database;

    constructor(
        db: PouchDB.Database,
        {
            introductionButtonChannelId,
            introductionButtonMessageId,
            screeningChannelId,
            introductions
        }: MetaIntroductionAutomator
    ) {
        this.introductionButtonChannelId = introductionButtonChannelId ?? null;
        this.introductionButtonMessageId = introductionButtonMessageId ?? null;
        this.screeningChannelId = screeningChannelId ?? null;
        this.introductions = introductions ?? [];
        this.db = db;
    }

    async setIntroductionButtonChannelId(
        newChannleId: string | null
    ): Promise<void> {
        this.introductionButtonChannelId = newChannleId;
        await this.updateDoc({
            introductionButtonChannelId: this.introductionButtonChannelId
        });
    }

    async setIntroductionButtonMessageId(
        newMessageId: string | null
    ): Promise<void> {
        this.introductionButtonMessageId = newMessageId;
        await this.updateDoc({
            introductionButtonMessageId: this.introductionButtonMessageId
        });
    }

    async setScreeningChannelId(newChannleId: string | null): Promise<void> {
        this.screeningChannelId = newChannleId;
        await this.updateDoc({
            screeningChannelId: this.screeningChannelId
        });
    }

    getIntroduction(
        ids: { userId?: string; introductionId?: string; }
    ): Introduction | null {
        const introduction = this.introductions.find((introduction) => {
            if (ids.userId === introduction.userId) {
                return true;
            }

            if (ids.introductionId === introduction.id) {
                return true;
            }

            return false;
        });

        if (introduction !== undefined) {
            return introduction;
        }

        return null;
    }

    async addIntroduction(introduction: Introduction): Promise<void> {
        this.introductions.push(introduction);

        await this.updateDoc({
            introductions: this.introductions
        });
    }

    async removeIntroduction(introductionId: string): Promise<void> {
        this.introductions = this.introductions.filter((introduction) => {
            return introduction.id !== introductionId;
        });

        await this.updateDoc({
            introductions: this.introductions
        });
    }

    async updateIntroduction(
        introductionUpdate: Partial<Introduction> & { id: string; }
    ): Promise<void> {
        const introduction = this.introductions.find((introduction) => {
            return introduction.id === introductionUpdate.id;
        });

        if (introduction === undefined) {
            return;
        }

        Object.assign(introduction, introductionUpdate);

        await this.updateDoc({
            introductions: this.introductions
        });
    }

    private async updateDoc(
        update: Partial<MetaIntroductionAutomator>
    ): Promise<void> {
        await this.db.upsert<Partial<MetaDocument>>(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    introductionAutomator: {
                        introductionButtonChannelId: null,
                        introductionButtonMessageId: null,
                        screeningChannelId: null,
                        introductions: [],
                        ...doc.introductionAutomator,
                        ...update
                    }
                };
            }
        );
    }
}
