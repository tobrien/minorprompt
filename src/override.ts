import { Formatter, Logger, Parser, Section, Weighted } from './minorPrompt';
import { DEFAULT_SECTION_OPTIONS, SectionOptions } from './items/section';
import { DEFAULT_LOGGER, wrapLogger } from './logger';
import path from 'path';
import { clean } from './util/general';
import * as Storage from './util/storage';
import { Parameters } from './minorPrompt';

export interface Options {
    logger?: Logger;
    configDir: string;
    overrides: boolean;
    parameters?: Parameters;
}

export interface Instance {
    customize: <T extends Weighted>(overrideFile: string, section: Section<T>, sectionOptions?: SectionOptions) => Promise<Section<T>>;
    override: <T extends Weighted>(overrideFile: string, section: Section<T>, sectionOptions?: SectionOptions) =>
        Promise<{ override?: Section<T>, prepend?: Section<T>, append?: Section<T> }>;
}

export const create = (options: Options): Instance => {
    const logger = wrapLogger(options?.logger || DEFAULT_LOGGER, 'Override');
    const storage = Storage.create({ log: logger.debug });
    const parameters = options?.parameters || {};

    const override = async <T extends Weighted>(
        overrideFile: string,
        section: Section<T>,
        sectionOptions?: SectionOptions
    ): Promise<{ override?: Section<T>, prepend?: Section<T>, append?: Section<T> }> => {
        let currentSectionOptions = DEFAULT_SECTION_OPTIONS;
        if (sectionOptions) {
            currentSectionOptions = {
                ...currentSectionOptions,
                ...clean(sectionOptions),
            }
        }

        const baseFile = path.join(options.configDir, overrideFile);
        const preFile = baseFile.replace('.md', '-pre.md');
        const postFile = baseFile.replace('.md', '-post.md');

        const response: { override?: Section<T>, prepend?: Section<T>, append?: Section<T> } = {};

        if (await storage.exists(preFile)) {
            logger.debug('Found pre file %s', preFile);
            const parser = Parser.create({ parameters });
            response.prepend = await parser.parseFile<T>(preFile, currentSectionOptions);
        }

        if (await storage.exists(postFile)) {
            logger.debug('Found post file %s', postFile);
            const parser = Parser.create({ parameters });
            response.append = await parser.parseFile<T>(postFile, currentSectionOptions);
        }

        if (await storage.exists(baseFile)) {
            logger.debug('Found base file %s', baseFile);
            if (options.overrides) {
                logger.warn('WARNING: Core directives are being overwritten by custom configuration');
                const parser = Parser.create({ parameters });
                response.override = await parser.parseFile<T>(baseFile, currentSectionOptions);
            } else {
                logger.error('ERROR: Core directives are being overwritten by custom configuration');
                throw new Error('Core directives are being overwritten by custom configuration, but overrides are not enabled.  Please enable --overrides to use this feature.');
            }
        }

        return response;
    }

    const customize = async <T extends Weighted>(overrideFile: string, section: Section<T>, sectionOptions?: SectionOptions): Promise<Section<T>> => {
        let currentSectionOptions = DEFAULT_SECTION_OPTIONS;
        if (sectionOptions) {
            currentSectionOptions = {
                ...currentSectionOptions,
                ...clean(sectionOptions),
            }
        }

        const { overrideContent, prepend, append }: { overrideContent?: Section<T>, prepend?: Section<T>, append?: Section<T> } = await override(overrideFile, section, currentSectionOptions);
        let finalSection: Section<T> = section;

        if (overrideContent) {
            if (options.overrides) {
                logger.warn('Override found, replacing content from file %s', overrideContent);
                finalSection = overrideContent;
            } else {
                logger.error('ERROR: Core directives are being overwritten by custom configuration');
                throw new Error('Core directives are being overwritten by custom configuration, but overrides are not enabled.  Please enable --overrides to use this feature.');
            }
        }

        if (prepend) {
            logger.debug('Prepend found, adding to content from file %s', prepend);
            finalSection = finalSection.prepend(prepend);
        }

        if (append) {
            logger.debug('Append found, adding to content from file %s', append);
            finalSection = finalSection.append(append);
        }

        const formatter = Formatter.create({ logger });
        logger.debug('Final section:\n\n%s\n\n', formatter.format(finalSection));

        return finalSection;
    }

    return {
        override,
        customize,
    }
}