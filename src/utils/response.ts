import { Response } from "../types/Response";

export const response = (
    code: string,
    value?: any
): Response => {
    return {
        responseCode: code,
        value
    };
};
