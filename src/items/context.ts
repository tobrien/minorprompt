import { Weighted, create as createWeighted } from "./weighted";

export type Context = Weighted;

export const create = (text: string): Context => {
    return createWeighted<Context>(text);
}

