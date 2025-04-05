import { BlackguardDbDocName } from "../constants";
import { MetaDocument } from "../types/MetaDocument";
import { MetaIntroductionAutomator } from "../types/MetaIntroductionAutomator";

export class IntroductionAutomator {
    introductionChannelId: string | null = null;
    introductionMessageId: string | null = null;
    screeningChannelId: string | null = null;
    screeningMessageId: string | null = null;
    db: PouchDB.Database;

    constructor(
        db: PouchDB.Database,
        {
            introductionChannelId,
            introductionMessageId,
            screeningChannelId: approvalChannelId,
            screeningMessageId: approvalMessageId
        }: MetaIntroductionAutomator
    ) {
        this.introductionChannelId = introductionChannelId ?? null;
        this.introductionMessageId = introductionMessageId ?? null;
        this.screeningChannelId = approvalChannelId ?? null;
        this.screeningMessageId = approvalMessageId ?? null;
        this.db = db;
    }

    async setIntroductionChannelId(newChannleId: string | null): Promise<void> {
        this.introductionChannelId = newChannleId;
        await this.updateDoc({
            introductionChannelId: this.introductionChannelId
        });
    }

    async setIntroductionMessageId(newMessageId: string | null): Promise<void> {
        this.introductionMessageId = newMessageId;
        await this.updateDoc({
            introductionMessageId: this.introductionMessageId
        });
    }

    async setScreeningChannelId(newChannleId: string | null): Promise<void> {
        this.screeningChannelId = newChannleId;
        await this.updateDoc({
            screeningChannelId: this.screeningChannelId
        });
    }

    async setScreeningMessageId(newMessageId: string | null): Promise<void> {
        this.screeningMessageId = newMessageId;
        await this.updateDoc({
            screeningMessageId: this.screeningMessageId
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
                        introductionChannelId: null,
                        introductionMessageId: null,
                        screeningChannelId: null,
                        screeningMessageId: null,
                        ...doc.introductionAutomator,
                        ...update
                    }
                };
            }
        );
    }
}
