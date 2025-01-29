import { WagerParticipantResult } from "./WagerParticipantResult";

export type WagerResult = {
    winners: WagerParticipantResult[];
    losers: WagerParticipantResult[];
};
