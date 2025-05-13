/**
 * @jest-environment node
 */

// @ts-nocheck - Disable type checking for this file to work around Jest ESM mock limitations
import { jest } from '@jest/globals';
import { join } from 'path';

// Mock modules before importing
jest.unstable_mockModule('../src/logger', () => {
    const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };

    const mockWrapLogger = jest.fn().mockImplementation(() => mockLogger);

    return {
        DEFAULT_LOGGER: mockLogger,
        wrapLogger: mockWrapLogger,
        Logger: mockLogger
    };
});

const mockSection = { add: jest.fn().mockReturnThis() };

const mockCreateSection = jest.fn().mockReturnValue(mockSection);

const mockParser = {
    parse: jest.fn().mockReturnValue(mockSection),
    parseFile: jest.fn().mockResolvedValue(mockSection)
};

const mockOverride = {
    customize: jest.fn().mockImplementation((_, section) => Promise.resolve(section))
};

const mockLoader = {
    load: jest.fn().mockResolvedValue([mockSection])
};

const mockCreatePrompt = jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('Mock Prompt Content')
});

jest.unstable_mockModule('../src/minorPrompt', () => {
    return {
        createSection: mockCreateSection,
        Parser: {
            create: jest.fn().mockReturnValue(mockParser)
        },
        Override: {
            create: jest.fn().mockReturnValue(mockOverride)
        },
        Loader: {
            create: jest.fn().mockReturnValue(mockLoader)
        },
        createPrompt: mockCreatePrompt
    };
});

let loggerModule;
let minorPromptModule;
let builder;

describe('Builder', () => {
    beforeEach(async () => {
        // Import modules after mocking
        loggerModule = await import('../src/logger');
        minorPromptModule = await import('../src/minorPrompt');
        builder = await import('../src/builder');

        jest.clearAllMocks();
    });

    test('create returns an instance with all expected methods', () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });

        expect(instance).toHaveProperty('addPersonaPath');
        expect(instance).toHaveProperty('addContextPath');
        expect(instance).toHaveProperty('addInstructionPath');
        expect(instance).toHaveProperty('addContentPath');
        expect(instance).toHaveProperty('addContent');
        expect(instance).toHaveProperty('addContext');
        expect(instance).toHaveProperty('loadContext');
        expect(instance).toHaveProperty('loadContent');
        expect(instance).toHaveProperty('build');
    });

    test('create sets up logger, parser, override, and loader with correct options', () => {
        const options = {
            logger: { custom: true, debug: jest.fn() },
            basePath: './custom-path',
            overridePath: './overrides',
            overrides: true,
            parameters: { key: 'value' }
        };

        builder.create(options);

        const { wrapLogger } = loggerModule;
        const { Parser, Override, Loader } = minorPromptModule;

        expect(wrapLogger).toHaveBeenCalledWith(options.logger, 'Builder');
        expect(Parser.create).toHaveBeenCalledWith({
            logger: expect.any(Object),
            parameters: options.parameters
        });
        expect(Override.create).toHaveBeenCalledWith({
            logger: expect.any(Object),
            configDir: options.overridePath,
            overrides: options.overrides
        });
        expect(Loader.create).toHaveBeenCalledWith({
            logger: expect.any(Object),
            parameters: options.parameters
        });
    });

    test('addPersonaPath loads and adds persona section', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const contentPath = 'persona/default.md';

        await instance.addPersonaPath(contentPath);

        expect(mockParser.parseFile).toHaveBeenCalledWith(join('./prompts', contentPath));
        expect(mockOverride.customize).toHaveBeenCalled();
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('addContextPath loads and adds context section', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const contentPath = 'context/default.md';

        await instance.addContextPath(contentPath);

        expect(mockParser.parseFile).toHaveBeenCalledWith(join('./prompts', contentPath));
        expect(mockOverride.customize).toHaveBeenCalled();
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('addInstructionPath loads and adds instruction section', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const contentPath = 'instructions/default.md';

        await instance.addInstructionPath(contentPath);

        expect(mockParser.parseFile).toHaveBeenCalledWith(join('./prompts', contentPath));
        expect(mockOverride.customize).toHaveBeenCalled();
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('addContentPath loads and adds content section', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const contentPath = 'content/default.md';

        await instance.addContentPath(contentPath);

        expect(mockParser.parseFile).toHaveBeenCalledWith(join('./prompts', contentPath));
        expect(mockOverride.customize).toHaveBeenCalled();
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('addContent parses and adds content string', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const content = 'Content string';

        await instance.addContent(content);

        expect(mockParser.parse).toHaveBeenCalledWith(content);
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('addContext parses and adds context string', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const context = 'Context string';

        await instance.addContext(context);

        expect(mockParser.parse).toHaveBeenCalledWith(context);
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('loadContext loads directories and adds context sections', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const directories = ['context1', 'context2'];

        await instance.loadContext(directories);

        expect(mockLoader.load).toHaveBeenCalledWith(directories);
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('loadContent loads directories and adds content sections', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });
        const directories = ['content1', 'content2'];

        await instance.loadContent(directories);

        expect(mockLoader.load).toHaveBeenCalledWith(directories);
        expect(mockSection.add).toHaveBeenCalled();
    });

    test('build creates and returns a prompt', async () => {
        const instance = builder.create({ basePath: './prompts', overrides: false });

        const prompt = await instance.build();

        expect(mockCreatePrompt).toHaveBeenCalled();
        expect(prompt).toEqual(expect.objectContaining({
            toString: expect.any(Function)
        }));
    });

    test('complete flow works correctly', async () => {
        const instance = builder.create({
            basePath: './prompts',
            overrides: true,
            parameters: { model: 'gpt-4' }
        });

        await instance.addPersonaPath('persona/default.md');
        await instance.addContextPath('context/default.md');
        await instance.addInstructionPath('instructions/default.md');
        await instance.addContentPath('content/default.md');
        await instance.addContent('Additional content');
        await instance.addContext('Additional context');

        const prompt = await instance.build();

        expect(mockCreatePrompt).toHaveBeenCalled();
        expect(prompt).toEqual(expect.objectContaining({
            toString: expect.any(Function)
        }));
    });
});
