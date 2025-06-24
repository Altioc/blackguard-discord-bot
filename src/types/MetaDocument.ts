import { BlackguardDbDocName, LogLevel } from "../constants";
import { MetaIntroductionAutomator } from "./MetaIntroductionAutomator";
import { MinimumDocument } from "./MinimumDocument";

export type MetaDocument = MinimumDocument & {
    _id: BlackguardDbDocName.Meta;
    introductionAutomator: MetaIntroductionAutomator;
    logLevel: LogLevel;
    loggingChannelId: string | null;
    memberRoles: string[];
    rejectedRole: string | null;
};
