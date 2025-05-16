import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createSection, Section } from '../src/minorPrompt';
import path from 'path';
import { DEFAULT_LOGGER } from '../src/logger';

// Setup mock functions
const mockExists = jest.fn();
const mockIsFile = jest.fn();
const mockIsDirectory = jest.fn();
const mockReadFile = jest.fn();
const mockListFiles = jest.fn();
const mockStorageCreate = jest.fn().mockReturnValue({
    exists: mockExists,
    isFile: mockIsFile,
    isDirectory: mockIsDirectory,
    readFile: mockReadFile,
    listFiles: mockListFiles
});

// Mock the storage module
jest.unstable_mockModule('../src/util/storage', () => ({
    create: mockStorageCreate
}));

const mockCreateSection = jest.fn();
const mockParser = jest.fn();
const mockOverride = jest.fn();
const mockLoader = jest.fn();
const mockCreatePrompt = jest.fn();

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

let minorPromptModule;

// We'll import these dynamically in the beforeEach
let loaderModule: {
    create: (options: any) => any;
    extractFirstHeader: (markdownText: string) => string | null;
    removeFirstHeader: (markdownText: string) => string;
};
let Storage;

describe('Loader', () => {

    beforeEach(async () => {
        jest.clearAllMocks();

        // Set default mock implementations
        mockIsDirectory.mockImplementation(() => Promise.resolve(false));
        mockIsFile.mockImplementation(() => Promise.resolve(false));
        mockExists.mockImplementation(() => Promise.resolve(false));

        // Dynamically import the modules after mocking
        Storage = await import('../src/util/storage');
        loaderModule = await import('../src/loader');
        minorPromptModule = await import('../src/minorPrompt');
    });

    // Tests for parameters handling
    describe('Parameters Handling', () => {

        it('should use empty parameters object when none provided', async () => {
            // Create loader without parameters
            const loader = loaderModule.create({});

            const contextDir = '/test/context';

            // Setup mocks for a simple directory with one file
            mockExists.mockImplementation(() => Promise.resolve(false));
            mockIsDirectory.mockImplementation(() => Promise.resolve(true));
            mockListFiles.mockImplementation(() => Promise.resolve(['file1.md']));
            mockIsFile.mockImplementation(() => Promise.resolve(true));
            mockReadFile.mockImplementation(() => Promise.resolve('# Test File\nContent'));

            await loader.load([contextDir]);

            // Check that createSection was called with empty parameters object
            expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({ parameters: {} }));
        });

        it('should pass custom parameters to created sections', async () => {
            // Create custom parameters
            const customParams = {
                temperature: 0.7,
                maxTokens: 1000,
                weight: 1.5
            };

            // Create loader with custom parameters
            const loader = loaderModule.create({ parameters: customParams });

            const contextDir = '/test/context';

            // Setup mocks for a simple directory with one file
            mockExists.mockImplementation(() => Promise.resolve(false));
            mockIsDirectory.mockImplementation(() => Promise.resolve(true));
            mockListFiles.mockImplementation(() => Promise.resolve(['file1.md']));
            mockIsFile.mockImplementation(() => Promise.resolve(true));
            mockReadFile.mockImplementation(() => Promise.resolve('# Test File\nContent'));

            await loader.load([contextDir]);

            // Check that createSection was called with our custom parameters
            expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({ parameters: customParams }));
        });

        it('should pass parameters to both main sections and subsections', async () => {
            // Create custom parameters
            const customParams = { weight: 2.0 };

            // Create loader with custom parameters
            const loader = loaderModule.create({ parameters: customParams });

            const contextDir = '/test/context';
            const contextFile = path.join(contextDir, 'context.md');

            // Setup mocks for a directory with context.md and one additional file
            // @ts-ignore
            mockExists.mockImplementation((filePath: string) => {
                return Promise.resolve(filePath === contextFile);
            });
            mockIsDirectory.mockImplementation(() => Promise.resolve(true));
            mockListFiles.mockImplementation(() => Promise.resolve(['context.md', 'file1.md']));
            // @ts-ignore
            mockIsFile.mockImplementation((filePath: string) => {
                return Promise.resolve(filePath !== contextDir);
            });
            // @ts-ignore
            mockReadFile.mockImplementation((filePath: string) => {
                if (filePath === contextFile) {
                    return Promise.resolve('# Context\nMain content');
                }
                return Promise.resolve('# File 1\nFile content');
            });
            // @ts-ignore
            mockCreateSection.mockImplementation((options: any) => {
                // Return an object that tracks subsections added
                const subsections: any[] = [];
                return {
                    add: jest.fn((content, opts) => {
                        // If the content is a section (has parameters property), count it
                        if (content && typeof content === 'object' && 'parameters' in content) {
                            subsections.push(content);
                        }
                    }),
                    parameters: options.parameters,
                    subsections // Track subsections to help with test assertions
                };
            });

            await loader.load([contextDir]);

            // Verify that all createSection calls included our parameters
            // Should be called for main section and file section
            const calls = mockCreateSection.mock.calls;
            expect(calls.length).toBeGreaterThanOrEqual(1); // At least the main section

            // Get the main section
            const mainSection = mockCreateSection.mock.results[0].value as {
                parameters: any;
                subsections: Array<{ parameters: any }>;
            };

            // Check that at least one file section was created and added to main section
            expect(mainSection.subsections.length).toBeGreaterThanOrEqual(1);

            // Check all sections for parameters (main and file section)
            expect(mainSection.parameters).toEqual(customParams);
            mainSection.subsections.forEach((section: { parameters: any }) => {
                expect(section.parameters).toEqual(customParams);
            });
        });

        it('should handle multiple context directories with the same parameters', async () => {
            // Create custom parameters
            const customParams = { weight: 1.2, system: true };

            // Create loader with custom parameters
            const loader = loaderModule.create({ parameters: customParams });

            const contextDir1 = '/test/context1';
            const contextDir2 = '/test/context2';

            // Setup mocks
            mockExists.mockImplementation(() => Promise.resolve(false));
            mockIsDirectory.mockImplementation(() => Promise.resolve(true));
            mockListFiles.mockImplementation(() => Promise.resolve([]));

            await loader.load([contextDir1, contextDir2]);

            // Should create two main sections with parameters
            expect(mockCreateSection).toHaveBeenCalledTimes(2);
            expect(mockCreateSection).toHaveBeenNthCalledWith(1, { parameters: customParams, title: 'context1' });
            expect(mockCreateSection).toHaveBeenNthCalledWith(2, { parameters: customParams, title: 'context2' });
        });
    });

});
