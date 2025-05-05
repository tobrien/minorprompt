import { Weighted, create as createWeighted } from "./weighted";

// Define Content as a type alias for Weighted
export type Content = Weighted;

// Export create function
export const create = (text: string): Content => {
    return createWeighted<Content>(text);
}

