import { DEFAULT_WEIGHTED_OPTIONS, Weighted, WeightedOptions, create as createWeighted } from "./weighted";

export type Context = Weighted;

export const DEFAULT_CONTEXT_OPTIONS: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;

export const create = (text: string, options: WeightedOptions = DEFAULT_CONTEXT_OPTIONS): Context => {
    return createWeighted<Context>(text, options);
}

