import { Weighted, create as createWeighted } from "./weighted";

export type Instruction = Weighted;

export const create = (text: string): Instruction => {
    return createWeighted<Instruction>(text);
}