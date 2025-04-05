import { v4 as uuid } from "uuid";
import { IntroductionScreeningStatus } from "../constants";
import { IntroductionInitializer } from "../types/IntroductionInitializer";

export class Introduction {
    public id: string;
    public userId: string;
    public guildId: string;
    public status: IntroductionScreeningStatus;
    public channelId: string;
    public messageId?: string;
    public preferedName: string;
    public ign?: string;
    public pronouns?: string;
    public referral: string;
    public joinReason: string;

    constructor(initializer: IntroductionInitializer) {
        this.id = initializer.id || uuid();
        this.userId = initializer.userId;
        this.guildId = initializer.guildId;
        this.status = initializer.status;
        this.channelId = initializer.channelId;
        this.messageId = initializer.messageId;
        this.preferedName = initializer.preferedName;
        this.ign = initializer.ign;
        this.pronouns = initializer.pronouns;
        this.referral = initializer.referral;
        this.joinReason = initializer.joinReason;
    }
}
