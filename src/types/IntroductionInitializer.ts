import { IntroductionScreeningStatus } from "../constants";

export type IntroductionInitializer = {
    id?: string;
    userId: string;
    guildId: string;
    status: IntroductionScreeningStatus;
    channelId: string;
    messageId?: string;
    preferedName: string;
    ign?: string;
    pronouns?: string;
    referral: string;
    joinReason: string;
};
