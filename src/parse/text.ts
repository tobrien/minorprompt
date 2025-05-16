import { create as createSection, DEFAULT_SECTION_OPTIONS, Section, SectionOptions } from '../items/section';
import { create as createWeighted, DEFAULT_WEIGHTED_OPTIONS, Weighted, WeightedOptions } from '../items/weighted';
import { clean } from '../util/general';

export const parseText = <T extends Weighted>(
    input: string | Buffer,
    options?: SectionOptions
): Section<T> => {

    let text;
    if (typeof input === 'string') {
        text = input;
    } else {
        text = input.toString();
    }


    let sectionOptions = DEFAULT_SECTION_OPTIONS;
    if (options) {
        sectionOptions = {
            ...sectionOptions,
            ...clean(options)
        };
    }


    // Set the item options
    let itemOptions: WeightedOptions = DEFAULT_WEIGHTED_OPTIONS;
    if (options?.parameters) {
        itemOptions = {
            ...itemOptions,
            ...clean({
                parameters: options.parameters!
            })
        };
    }
    if (options?.itemWeight) {
        itemOptions = {
            ...itemOptions,
            ...clean({
                weight: options.itemWeight!
            })
        };
    }

    // Split the text on newlines
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    // Create the main section with the supplied title
    const mainSection = createSection<T>(sectionOptions);

    for (const line of lines) {
        const instruction: T = createWeighted<T>(line, itemOptions);
        mainSection.add(instruction, itemOptions);
    }

    return mainSection;
}
