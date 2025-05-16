import path from "path";
import { DEFAULT_LOGGER, Logger, wrapLogger } from "./logger";
import { createSection, Loader, Override, Parser, Prompt, Section } from "./minorPrompt";
import { Content, Context, createPrompt, Instruction, Parameters, Weighted } from "./minorPrompt";

export interface Options {
    logger?: Logger;
    basePath: string;
    overridePath?: string;
    overrides: boolean;
    parameters?: Parameters;
}

export interface Instance {
    addPersonaPath(contentPath: string): Promise<Instance>;
    addContextPath(contentPath: string): Promise<Instance>;
    addInstructionPath(contentPath: string): Promise<Instance>;
    addContentPath(contentPath: string): Promise<Instance>;
    addContent(content: string, title?: string): Promise<Instance>;
    addContext(context: string, title?: string): Promise<Instance>;
    loadContext(contextDirectories: string[]): Promise<Instance>;
    loadContent(contentDirectories: string[]): Promise<Instance>;
    build(): Promise<Prompt>;
}

export const create = (options: Options): Instance => {
    const parameters = options?.parameters || {};
    const logger = wrapLogger(options?.logger || DEFAULT_LOGGER, 'Builder');
    const parser = Parser.create({ logger, parameters });
    const override = Override.create({ logger, configDir: options.overridePath || "./", overrides: options.overrides });
    const loader = Loader.create({ logger, parameters });

    const personaSection: Section<Instruction> = createSection({ title: "Persona", parameters });
    const contextSection: Section<Context> = createSection({ title: "Context", parameters });
    const instructionSection: Section<Instruction> = createSection({ title: "Instruction", parameters });
    const contentSection: Section<Content> = createSection({ title: "Content", parameters });


    const instance: Partial<Instance> = {}

    const loadDirectories = async <T extends Weighted>(directories: string[]): Promise<Section<T>[]> => {
        logger.debug("Loading directories", directories);
        const sections: Section<T>[] = await loader.load<T>(directories);
        return sections;
    }

    const loadContext = async (contextDirectories: string[]): Promise<Instance> => {
        logger.debug('Loading context');
        const context: Section<Context>[] = await loadDirectories<Context>(contextDirectories);
        contextSection.add(context, { parameters });
        return instance as Instance;
    }
    instance.loadContext = loadContext;

    const loadContent = async (contentDirectories: string[]): Promise<Instance> => {
        logger.debug("Loading content");
        const content: Section<Content>[] = await loadDirectories<Content>(contentDirectories);
        contentSection.add(content, { parameters });
        return instance as Instance;
    }
    instance.loadContent = loadContent;

    const loadPath = async <T extends Weighted>(contentPath: string): Promise<Section<T>> => {
        logger.debug("Loading path", contentPath);
        const defaultPath = path.join(options.basePath, contentPath);
        const section: Section<T> = await parser.parseFile<T>(defaultPath);
        const overrideSection = await override.customize<T>(contentPath, section, { parameters });
        return overrideSection;
    }

    const addPersonaPath = async (contentPath: string): Promise<Instance> => {
        logger.debug("Adding persona path");
        const persona: Section<Instruction> = await loadPath<Instruction>(contentPath);
        personaSection.add(persona);
        return instance as Instance;
    }
    instance.addPersonaPath = addPersonaPath;

    const addContextPath = async (contentPath: string): Promise<Instance> => {
        logger.debug("Adding context path");
        const context: Section<Context> = await loadPath<Context>(contentPath);
        contextSection.add(context);
        return instance as Instance;
    }
    instance.addContextPath = addContextPath;

    const addInstructionPath = async (contentPath: string): Promise<Instance> => {
        logger.debug("Adding instruction path");
        const instruction: Section<Instruction> = await loadPath<Instruction>(contentPath);
        instructionSection.add(instruction);
        return instance as Instance;
    }
    instance.addInstructionPath = addInstructionPath;

    const addContentPath = async (contentPath: string): Promise<Instance> => {
        logger.debug("Adding content path");
        const content: Section<Content> = await loadPath<Content>(contentPath);
        contentSection.add(content);
        return instance as Instance;
    }
    instance.addContentPath = addContentPath;

    const addContent = async (content: string | Buffer, title?: string): Promise<Instance> => {
        logger.debug("Adding content");
        const parsedContentSection: Section<Content> = parser.parse<Content>(content, { title });
        contentSection.add(parsedContentSection);
        return instance as Instance;
    }
    instance.addContent = addContent;

    const addContext = async (context: string | Buffer, title?: string): Promise<Instance> => {
        logger.debug("Adding context");
        const parsedContextSection: Section<Context> = parser.parse<Context>(context, { title });
        contextSection.add(parsedContextSection);
        return instance as Instance;
    }
    instance.addContext = addContext;

    const build = async () => {
        logger.debug("Building prompt");
        const prompt = createPrompt({ persona: personaSection, contexts: contextSection, instructions: instructionSection, contents: contentSection });
        return prompt;
    }
    instance.build = build;

    return instance as Instance;
}
