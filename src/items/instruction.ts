import { DEFAULT_WEIGHTED_OPTIONS, Weighted, WeightedOptions, create as createWeighted } from "./weighted";

export type Instruction = Weighted;

export const DEFAULT_INSTRUCTION_OPTIONS: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;

export const create = (text: string, options: WeightedOptions = DEFAULT_INSTRUCTION_OPTIONS): Instruction => {
    return createWeighted<Instruction>(text, options);
}