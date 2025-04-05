import { BlackguardDbDocName } from "../constants";
import { MetaIntroductionAutomator } from "./MetaIntroductionAutomator";
import { MinimumDocument } from "./MinimumDocument";

export type MetaDocument = MinimumDocument & {
    _id: BlackguardDbDocName.Meta;
    introductionAutomator: MetaIntroductionAutomator;
    memberRoles: string[];
    rejectedRole: string | null;
};
