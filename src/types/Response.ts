export type Response<T extends any = any> = {
    responseCode: string;
    value: T;
};
