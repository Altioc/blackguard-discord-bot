import { BlackguardDbDocName } from "../constants";
import { MetaDocument } from "../types/MetaDocument";
import { MetaIntroductionAutomator } from "../types/MetaIntroductionAutomator";

export class IntroductionAutomator {
    channelId: string | null = null;
    messageId: string | null = null;
    db: PouchDB.Database;

    constructor(
        db: PouchDB.Database,
        { channelId, messageId }: MetaIntroductionAutomator
    ) {
        this.channelId = channelId ?? null;
        this.messageId = messageId ?? null;
        this.db = db;
    }

    async setChannelId(newChannleId: string | null): Promise<void> {
        this.channelId = newChannleId;
        await this.updateDoc({
            channelId: this.channelId,
            messageId: this.messageId
        });
    }

    async setMessageId(newMessageId: string | null): Promise<void> {
        this.messageId = newMessageId;
        await this.updateDoc({
            channelId: this.channelId,
            messageId: this.messageId
        });
    }

    private async updateDoc(
        update: MetaIntroductionAutomator
    ): Promise<void> {
        await this.db.upsert<Partial<MetaDocument>>(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    introductionAutomator: {
                        ...doc.introductionAutomator,
                        ...update
                    }
                };
            }
        );
    }
}
