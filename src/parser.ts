import * as fs from 'fs/promises';
import { Parameters } from 'minorPrompt';
import * as path from 'path';
import { Section, SectionOptions } from './items/section';
import { Weighted } from './items/weighted';
import { DEFAULT_LOGGER, Logger, wrapLogger } from './logger';
import { parseMarkdown } from './parse/markdown';
import { parseText } from './parse/text';
import { isMarkdown } from './util/markdown';
import { isText } from './util/text';

export interface Options {
    logger?: Logger;
    parameters?: Parameters;
}

export interface Instance {
    parse: <T extends Weighted>(input: string | Buffer, options?: SectionOptions) => Section<T>;
    parseFile: <T extends Weighted>(filePath: string, options?: SectionOptions) => Promise<Section<T>>;
}

export const create = (options?: Options): Instance => {
    const logger = wrapLogger(options?.logger || DEFAULT_LOGGER, 'Parser');

    const parseFile = async <T extends Weighted>(filePath: string, options?: SectionOptions): Promise<Section<T>> => {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Only use the filename as title if no title was explicitly provided
            const fileName = path.basename(filePath, path.extname(filePath));
            const updatedOptions = {
                ...options,
                title: options?.title || fileName
            };
            return parse(content, updatedOptions);
        } catch (error) {
            // Log the error or handle it appropriately
            logger.error(`Error reading or parsing file with marked at ${filePath}:`, error);
            throw new Error(`Failed to parse instructions from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Reads Markdown content and parses it into a single Section.
     * 
     * - If the content starts with a heading, that becomes the title of the returned Section
     * - If no heading at the start, creates a Section with no title
     * - Headers within the content create nested sections based on their depth
     * - All content is organized in a hierarchical structure based on heading levels
     *
     * @param content The content to parse
     * @returns A Section containing all content in a hierarchical structure
     */
    const parse = <T extends Weighted>(content: string | Buffer, options?: SectionOptions): Section<T> => {
        let mainSection: Section<T>;
        if (isMarkdown(content)) {
            mainSection = parseMarkdown<T>(content, options);
        } else if (isText(content)) {
            mainSection = parseText<T>(content, options);
        } else {
            throw new Error(`Unsupported content supplied to parse, minorprompt currently only supports markdown and text`);
        }
        return mainSection;
    }

    return {
        parse,
        parseFile
    }
}