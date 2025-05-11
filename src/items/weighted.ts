import { clean } from "../util/general";
import { Parameters, apply as applyParameters } from "./parameters";

export interface Weighted {
    text: string;
    weight?: number;
}

export interface WeightedOptions {
    weight?: number;
    parameters?: Parameters;
}

export const DEFAULT_WEIGHTED_OPTIONS: WeightedOptions = { weight: 1.0, parameters: {} };

export const create = <T extends Weighted>(
    text: string,
    options?: WeightedOptions
): T => {
    let weightedOptions: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;
    if (options) {
        weightedOptions = {
            ...DEFAULT_WEIGHTED_OPTIONS,
            ...clean(options)
        };
    }
    const parameterizedText = applyParameters(text, weightedOptions.parameters);

    return {
        text: parameterizedText,
        weight: weightedOptions.weight,
    } as T;
}