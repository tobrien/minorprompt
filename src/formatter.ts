import { Instruction } from "minorPrompt";
import * as Chat from "./chat";
import { getPersonaRole, Message, Model } from "./chat";
import { DEFAULT_FORMAT_OPTIONS } from "./constants";
import { Section } from "./items/section";
import { Weighted } from "./items/weighted";
import { Prompt } from "./prompt";

export type SectionSeparator = "tag" | "markdown";
export type SectionTitleProperty = "title" | "name";

export interface FormatOptions {
    sectionSeparator: SectionSeparator;
    sectionIndentation: boolean;
    sectionTitleProperty: SectionTitleProperty;
    sectionTitlePrefix?: string;
    sectionTitleSeparator?: string;
    sectionDepth: number;
}

// Type guard to check if an object is a Section
function isSection<T extends Weighted>(obj: T | Section<T>): obj is Section<T> {
    return obj && typeof obj === 'object' && 'items' in obj && Array.isArray((obj as Section<T>).items);
}

export const formatPersona = (model: Model, persona: Section<Instruction>, options?: Partial<FormatOptions>): Message => {

    let formatOptions: FormatOptions = DEFAULT_FORMAT_OPTIONS;
    if (options) {
        formatOptions = {
            ...formatOptions,
            ...options,
        };
    }

    const formattedPersona = formatSection(persona, formatOptions);

    return {
        role: getPersonaRole(model),
        content: `${formattedPersona}`,
    }
}

export const format = <T extends Weighted>(
    weightedText: T | Section<T>,
    options?: Partial<FormatOptions>
): string => {

    let formatOptions: FormatOptions = DEFAULT_FORMAT_OPTIONS;
    if (options) {
        formatOptions = {
            ...formatOptions,
            ...options,
        };
    }

    let result: string = "";
    if (isSection(weightedText)) {
        result = formatSection(weightedText, formatOptions);
    } else {
        const item = weightedText;
        result = item.text;
    }
    return result;
}

export const formatSection = <T extends Weighted>(section: Section<T>, options?: Partial<FormatOptions>): string => {
    let formatOptions: FormatOptions = DEFAULT_FORMAT_OPTIONS;
    if (options) {
        formatOptions = {
            ...formatOptions,
            ...options,
        };
    }

    const formattedItems = section.items.map(item => format(item, { ...formatOptions, sectionDepth: formatOptions.sectionDepth + 1 })).join("\n\n");

    if (formatOptions.sectionSeparator === "tag") {
        return `<${section.title ?? "section"}>\n${formattedItems}\n</${section.title ?? "section"}>`;
    } else {
        // Default depth to 1 if not provided, resulting in H2 (##) matching the test case.
        const headingLevel = (formatOptions.sectionDepth ?? 1) + 1;
        const hashes = '#'.repeat(headingLevel);
        return `${hashes} ${formatOptions.sectionTitlePrefix ? `${formatOptions.sectionTitlePrefix} ${formatOptions.sectionTitleSeparator} ` : ""}${section.title}\n\n${formattedItems}`;
    }
}

// Helper function to format arrays of items or sections
export const formatArray = <T extends Weighted>(
    items: (T | Section<T>)[],
    options?: Partial<FormatOptions>
): string => {
    let formatOptions: FormatOptions = DEFAULT_FORMAT_OPTIONS;
    if (options) {
        formatOptions = {
            ...formatOptions,
            ...options,
        };
    }

    return items.map(item => format(item, formatOptions)).join("\n\n");
}

export const formatPrompt = (model: Model, prompt: Prompt, options?: Partial<FormatOptions>): Chat.Request => {
    let formatOptions: FormatOptions = DEFAULT_FORMAT_OPTIONS;
    if (options) {
        formatOptions = {
            ...formatOptions,
            ...options,
        };
    }

    const chatRequest: Chat.Request = Chat.createRequest(model);

    [prompt.persona].forEach((persona: Section<Instruction>) => {
        chatRequest.addMessage(formatPersona(model, persona, formatOptions));
    });

    const formattedAreas = [
        formatSection(prompt.instructions, formatOptions),
        formatSection(prompt.contents, formatOptions),
        formatSection(prompt.contexts, formatOptions),
    ].join("\n\n");

    chatRequest.addMessage({
        role: "user",
        content: formattedAreas,
    });

    return chatRequest;
}