import { Weighted, create as createWeighted } from "./weighted";

export type Trait = Weighted;

export const create = (text: string): Trait => {
    return createWeighted<Trait>(text);
}