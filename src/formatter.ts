import { Instruction, Logger } from "minorPrompt";
import * as Chat from "./chat";
import { getPersonaRole, Message, Model } from "./chat";
import { Section } from "./items/section";
import { Weighted } from "./items/weighted";
import { Prompt } from "./prompt";
import { clean } from "./util/general";
import { DEFAULT_LOGGER, wrapLogger } from "./logger";

export interface Options {
    logger?: Logger;
    formatOptions?: Partial<FormatOptions>;
}

export interface Instance {
    formatPersona: (model: Model, persona: Section<Instruction>) => Message;
    format: <T extends Weighted>(weightedText: T | Section<T>, sectionDepth?: number) => string;
    formatArray: <T extends Weighted>(items: (T | Section<T>)[], sectionDepth?: number) => string;
    formatPrompt: (model: Model, prompt: Prompt) => Chat.Request;
}

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

export const DEFAULT_SECTION_SEPARATOR: SectionSeparator = "tag";
export const DEFAULT_SECTION_INDENTATION = true;
export const DEFAULT_SECTION_TAG = "section";
export const DEFAULT_SECTION_TITLE_PROPERTY = "title";

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
    sectionSeparator: DEFAULT_SECTION_SEPARATOR,
    sectionIndentation: DEFAULT_SECTION_INDENTATION,
    sectionTitleProperty: DEFAULT_SECTION_TITLE_PROPERTY,
    sectionDepth: 0,
}


// Type guard to check if an object is a Section
function isSection<T extends Weighted>(obj: T | Section<T>): obj is Section<T> {
    return obj && typeof obj === 'object' && 'items' in obj && Array.isArray((obj as Section<T>).items);
}

export const create = (options?: Options): Instance => {
    const logger = wrapLogger(options?.logger || DEFAULT_LOGGER);

    let formatOptions: FormatOptions = DEFAULT_FORMAT_OPTIONS;
    if (options?.formatOptions) {
        formatOptions = {
            ...formatOptions,
            ...clean(options.formatOptions),
        };
    }

    const formatPersona = (model: Model, persona: Section<Instruction>): Message => {
        logger.debug(`Formatting persona`);
        const formattedPersona = formatSection(persona);

        return {
            role: getPersonaRole(model),
            content: `${formattedPersona}`,
        }
    }

    const format = <T extends Weighted>(
        weightedText: T | Section<T>,
        sectionDepth?: number,
    ): string => {
        logger.debug(`Formatting ${isSection(weightedText) ? "section" : "item"}`);
        const currentSectionDepth: number = sectionDepth ? sectionDepth : formatOptions.sectionDepth;
        logger.debug(`\fCurrent section depth: ${currentSectionDepth}`);

        let result: string = "";
        if (isSection(weightedText)) {
            result = formatSection(weightedText, currentSectionDepth + 1);
        } else {
            const item = weightedText;
            result = item.text;
        }
        return result;
    }

    const formatSection = <T extends Weighted>(section: Section<T>, sectionDepth?: number): string => {
        logger.debug(`Formatting section`);
        const currentSectionDepth: number = sectionDepth ? sectionDepth : formatOptions.sectionDepth;
        logger.debug(`\t\tCurrent section depth: ${currentSectionDepth}`);

        const formattedItems = section.items.map(item => format(item, currentSectionDepth)).join("\n\n");

        if (formatOptions.sectionSeparator === "tag") {
            return `<${section.title ?? "section"}>\n${formattedItems}\n</${section.title ?? "section"}>`;
        } else {
            // Default depth to 1 if not provided, resulting in H2 (##) matching the test case.
            const headingLevel = (currentSectionDepth ?? 1);
            const hashes = '#'.repeat(headingLevel);
            logger.debug(`\t\tHeading level: ${headingLevel}`);
            logger.debug(`\t\tSection title: ${section.title}`);
            return `${hashes} ${formatOptions.sectionTitlePrefix ? `${formatOptions.sectionTitlePrefix} ${formatOptions.sectionTitleSeparator} ` : ""}${section.title}\n\n${formattedItems}`;
        }
    }

    // Helper function to format arrays of items or sections
    const formatArray = <T extends Weighted>(
        items: (T | Section<T>)[],
        sectionDepth?: number
    ): string => {
        logger.debug(`Formatting array`);
        const currentSectionDepth: number = sectionDepth ? sectionDepth : formatOptions.sectionDepth;
        return items.map(item => format(item, currentSectionDepth)).join("\n\n");
    }

    const formatPrompt = (model: Model, prompt: Prompt): Chat.Request => {
        logger.debug('Formatting prompt');
        const chatRequest: Chat.Request = Chat.createRequest(model);

        [prompt.persona].forEach((persona: Section<Instruction>) => {
            chatRequest.addMessage(formatPersona(model, persona));
        });

        const formattedAreas = [
            formatSection(prompt.instructions),
            formatSection(prompt.contents),
            formatSection(prompt.contexts),
        ].join("\n\n");

        chatRequest.addMessage({
            role: "user",
            content: formattedAreas,
        });

        return chatRequest;
    }

    return {
        formatPersona,
        format,
        formatPrompt,
        formatArray,
    }
}
