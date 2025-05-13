import { clean } from "../util/general";
import { Parameters } from "./parameters";
import { DEFAULT_WEIGHTED_OPTIONS, Weighted, WeightedOptions, create as createWeighted } from "./weighted";

export interface Section<T extends Weighted> {
    title?: string;
    items: (T | Section<T>)[];
    weight?: number;
    add: (
        item: T | T[] | Section<T> | Section<T>[] | string | string[],
        options?: WeightedOptions
    ) => Section<T>;
    append: (
        item: T | T[] | Section<T> | Section<T>[] | string | string[],
        options?: WeightedOptions
    ) => Section<T>;
    prepend: (
        item: T | T[] | Section<T> | Section<T>[] | string | string[],
        options?: WeightedOptions
    ) => Section<T>;
    insert: (
        index: number,
        item: T | T[] | Section<T> | Section<T>[] | string | string[],
        options?: WeightedOptions
    ) => Section<T>;
    replace: (
        index: number,
        item: T | Section<T> | string,
        options?: WeightedOptions
    ) => Section<T>;
    remove: (index: number) => Section<T>;
}

export interface SectionOptions {
    weight?: number;
    itemWeight?: number;
    parameters?: Parameters;
}

export const DEFAULT_SECTION_OPTIONS: SectionOptions = { weight: 1.0, itemWeight: 1.0, parameters: {} };

export const isSection = (object: any): boolean => {
    return object !== undefined && object != null && typeof object === 'object' && 'items' in object;
}

export const convertToSection = (
    object: any,
    options?: SectionOptions
): Section<Weighted> => {
    let sectionOptions: SectionOptions = DEFAULT_SECTION_OPTIONS;
    if (options) {
        sectionOptions = {
            ...DEFAULT_SECTION_OPTIONS,
            ...clean(options)
        };
    }

    let weightedOptions: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;
    if (sectionOptions.itemWeight) {
        weightedOptions = {
            ...DEFAULT_WEIGHTED_OPTIONS,
            weight: sectionOptions.itemWeight,
            parameters: sectionOptions.parameters
        };
    }

    if (isSection(object)) {
        const section = create(object.title, sectionOptions);
        object.items.forEach((item: any) => {
            if (isSection(item)) {
                section.append(convertToSection(item, sectionOptions));
            } else {
                section.append(createWeighted(item.text, weightedOptions));
            }
        });
        return section;
    } else {
        throw new Error('Object is not a section');
    }
}

export const create = <T extends Weighted>(
    title: string,
    options?: SectionOptions
): Section<T> => {
    const items: (T | Section<T>)[] = [];
    let sectionOptions: SectionOptions = DEFAULT_SECTION_OPTIONS;
    if (options) {
        sectionOptions = {
            ...DEFAULT_SECTION_OPTIONS,
            ...clean(options)
        };
    }

    let weightedOptions: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;
    if (sectionOptions.itemWeight) {
        weightedOptions = {
            ...DEFAULT_WEIGHTED_OPTIONS,
            weight: sectionOptions.itemWeight,
            parameters: sectionOptions.parameters
        };
    }

    const weight = sectionOptions.weight || 1.0;

    const append = (item: T | T[] | Section<T> | Section<T>[] | string | string[], options?: WeightedOptions): Section<T> => {
        let itemOptions: WeightedOptions = weightedOptions;
        if (options) {
            itemOptions = { ...itemOptions, ...clean(options) };
        }

        if (Array.isArray(item)) {
            item.forEach((item) => {
                append(item);
            });
        } else {
            if (typeof item === 'string') {
                items.push(createWeighted<T>(item, itemOptions));
            } else {
                items.push(item);
            }
        }
        return section;
    }

    const prepend = (item: T | T[] | Section<T> | Section<T>[] | string | string[], options?: WeightedOptions): Section<T> => {
        let itemOptions: WeightedOptions = weightedOptions;
        if (options) {
            itemOptions = { ...itemOptions, ...clean(options) };
        }
        if (Array.isArray(item)) {
            item.forEach((item) => {
                prepend(item);
            });
        } else {
            if (typeof item === 'string') {
                items.unshift(createWeighted<T>(item, itemOptions));
            } else {
                items.unshift(item);
            }
        }
        return section;
    }

    const insert = (index: number, item: T | T[] | Section<T> | Section<T>[] | string | string[], options?: WeightedOptions): Section<T> => {
        let itemOptions: WeightedOptions = weightedOptions;
        if (options) {
            itemOptions = { ...itemOptions, ...clean(options) };
        }
        if (Array.isArray(item)) {
            item.forEach((item) => {
                insert(index, item);
            });
        } else {
            if (typeof item === 'string') {
                items.splice(index, 0, createWeighted<T>(item, itemOptions));
            } else {
                items.splice(index, 0, item);
            }
        }
        return section;
    }

    const remove = (index: number): Section<T> => {
        items.splice(index, 1);
        return section;
    }

    const replace = (index: number, item: T | Section<T> | string, options?: WeightedOptions): Section<T> => {
        let itemOptions: WeightedOptions = weightedOptions;
        if (options) {
            itemOptions = { ...itemOptions, ...clean(options) };
        }
        if (typeof item === 'string') {
            items[index] = createWeighted<T>(item, itemOptions);
        } else {
            items[index] = item;
        }
        return section;
    }

    const add = (item: T | T[] | Section<T> | Section<T>[] | string | string[], options?: WeightedOptions): Section<T> => {
        let itemOptions: WeightedOptions = weightedOptions;
        if (options) {
            itemOptions = { ...itemOptions, ...clean(options) };
        }
        return append(item, itemOptions);
    }

    const section: Section<T> = {
        title,
        items,
        weight,
        add,
        append,
        prepend,
        insert,
        remove,
        replace,
    }

    return section;
}


