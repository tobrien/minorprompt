import * as Chat from "./chat";
import { getPersonaRole } from "./chat";
import { ChatRequest, Message, Model } from "./chat.d";
import { DEFAULT_AREA_SEPARATOR, DEFAULT_CONTENTS_AREA_TITLE, DEFAULT_CONTEXT_AREA_TITLE, DEFAULT_FORMAT_OPTIONS, DEFAULT_INSTRUCTIONS_AREA_TITLE, DEFAULT_SECTION_INDENTATION, DEFAULT_SECTION_SEPARATOR, DEFAULT_SECTION_TITLE_PREFIX, DEFAULT_SECTION_TITLE_PROPERTY, DEFAULT_SECTION_TITLE_SEPARATOR } from "./constants";
import { AreaSeparator, FormatOptions, Formatter, SectionSeparator, SectionTitleProperty } from "./formatter.d";
import { MinorPrompt, Persona, Section, WeightedText } from "./minorPrompt.d";

// Type guard to check if an object is a Section
function isSection<T extends WeightedText>(obj: T | Section<T>): obj is Section<T> {
    return obj && typeof obj === 'object' && 'items' in obj && Array.isArray((obj as Section<T>).items);
}

export const formatPersona = (model: Model, persona: Persona): Message => {
    return {
        role: getPersonaRole(model),
        content: `${persona.traits.join("\n")}\n\n${persona.instructions.join("\n")}`,
    }
}

export const format = <T extends WeightedText>(
    weightedText: T | Section<T>,
    options: FormatOptions
): string => {

    const titleProperty = options.sectionTitleProperty ?? DEFAULT_SECTION_TITLE_PROPERTY;
    const titlePrefix = options.sectionTitlePrefix ?? DEFAULT_SECTION_TITLE_PREFIX;
    const titleSeparator = options.sectionTitleSeparator ?? DEFAULT_SECTION_TITLE_SEPARATOR;
    const sectionSeparator = options.sectionSeparator ?? DEFAULT_SECTION_SEPARATOR;

    let result: string = "";
    if (isSection(weightedText)) {
        const section = weightedText;
        const title = section[titleProperty as keyof Section<T>];
        const content = section.items.map((item: T) => format(item, options)).join("\n\n");

        if (sectionSeparator === "tag") {
            result = `<section title="${title}">\n  ${content}\n</section>`;
        } else {
            result = `#### ${titlePrefix}${titleSeparator}${title}\n\n${content}`;
        }
    } else {
        const item = weightedText;
        result = item.text;
    }
    return result;
}

const formatArea = <T extends WeightedText>(items: (T | Section<T>)[], title: string, options: FormatOptions): string => {
    const areaSeparator = options.areaSeparator ?? DEFAULT_AREA_SEPARATOR;

    const formattedItems = items.map(item => format(item, options)).join("\n\n");

    if (areaSeparator === "tag") {
        return `<section title="${title}">\n  ${formattedItems}\n</section>`;
    } else {
        return `#### ${title}\n\n${formattedItems}`;
    }
}

// Helper function to format arrays of items or sections
export const formatArray = <T extends WeightedText>(
    items: (T | Section<T>)[],
    options: FormatOptions
): string => {
    return items.map(item => format(item, options)).join("\n\n");
}

export const create = (model: Model, options: {
    areaSeparator?: AreaSeparator;
    sectionSeparator?: SectionSeparator;
    sectionIndentation?: boolean;
    sectionTitleProperty?: SectionTitleProperty;
    sectionTitlePrefix?: string;
    sectionTitleSeparator?: string;
} = DEFAULT_FORMAT_OPTIONS): Formatter => {

    const formatOptions: FormatOptions = {
        areaSeparator: options.areaSeparator ?? DEFAULT_AREA_SEPARATOR,
        sectionSeparator: options.sectionSeparator ?? DEFAULT_SECTION_SEPARATOR,
        sectionIndentation: options.sectionIndentation ?? DEFAULT_SECTION_INDENTATION,
        sectionTitleProperty: options.sectionTitleProperty ?? DEFAULT_SECTION_TITLE_PROPERTY,
        sectionTitlePrefix: options.sectionTitlePrefix ?? DEFAULT_SECTION_TITLE_PREFIX,
        sectionTitleSeparator: options.sectionTitleSeparator ?? DEFAULT_SECTION_TITLE_SEPARATOR,
    };


    const formatPrompt = (prompt: MinorPrompt): ChatRequest => {
        const chatRequest: ChatRequest = Chat.createChatRequest(model);

        prompt.personas.forEach(persona => {
            chatRequest.addMessage(formatPersona(model, persona));
        });

        const formattedAreas = [
            formatArea(prompt.instructions, DEFAULT_INSTRUCTIONS_AREA_TITLE, formatOptions),
            formatArea(prompt.contents, DEFAULT_CONTENTS_AREA_TITLE, formatOptions),
            formatArea(prompt.contexts, DEFAULT_CONTEXT_AREA_TITLE, formatOptions),
        ].join("\n\n");

        chatRequest.addMessage({
            role: "user",
            content: formattedAreas,
        });

        return chatRequest;
    }

    return {
        format: formatPrompt,
    }
}

