import { Introduction } from "../models/Introduction";

export type MetaIntroductionAutomator = {
    introductionButtonChannelId: string | null;
    introductionButtonMessageId: string | null;
    screeningChannelId: string | null;
    introductions: Introduction[];
};
