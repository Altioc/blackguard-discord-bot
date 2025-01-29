import { BlackguardDbDocName } from "../constants";
import { MinimumDocument } from "./MinimumDocument";
import { WagerConstructorParameters } from "./WagerConstructorParameters";

export type BookDocument = MinimumDocument & {
    _id: BlackguardDbDocName.Books;
    latestWager: null | WagerConstructorParameters;
    config: {
        wagerTimeoutMs: number;
    };
};
