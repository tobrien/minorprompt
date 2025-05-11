import { DEFAULT_WEIGHTED_OPTIONS, Weighted, WeightedOptions, create as createWeighted } from "./weighted";

export type Trait = Weighted;

export const DEFAULT_TRAIT_OPTIONS: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;

export const create = (text: string, options: WeightedOptions = DEFAULT_TRAIT_OPTIONS): Trait => {
    return createWeighted<Trait>(text, options);
}