import { DEFAULT_WEIGHTED_OPTIONS, Weighted, WeightedOptions, create as createWeighted } from "./weighted";

// Define Content as a type alias for Weighted
export type Content = Weighted;

export const DEFAULT_CONTENT_OPTIONS: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;

// Export create function
export const create = (text: string, options: WeightedOptions = DEFAULT_CONTENT_OPTIONS): Content => {
    return createWeighted<Content>(text, options);
}

