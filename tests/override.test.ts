import { jest } from '@jest/globals';
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import type { Logger } from '../src/logger';
import type { Options, Instance } from '../src/override';

// Define types for mocks
interface MockStorage {
    exists: jest.Mock;
}

// Create a typed mock object for Section
type MockSection = {
    // @ts-ignore
    prepend: jest.Mock<any, any>;
    // @ts-ignore
    append: jest.Mock<any, any>;
    items: any[];
    add: jest.Mock;
    insert: jest.Mock;
    replace: jest.Mock;
    remove: jest.Mock;
};

const mockSection: MockSection = {
    prepend: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    items: [],
    add: jest.fn(),
    insert: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn()
};

let mockStorageInstance: MockStorage;
const mockLogger: Logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
    silly: jest.fn()
};

// Mock modules before importing the module under test
jest.unstable_mockModule('../src/util/storage', () => ({
    create: jest.fn(() => mockStorageInstance)
}));

jest.unstable_mockModule('../src/minorPrompt', () => ({
    Parser: {
        create: jest.fn(() => ({
            parseFile: jest.fn(async () => mockSection)
        }))
    },
    Formatter: {
        create: jest.fn(() => ({
            format: jest.fn(() => 'formatted section')
        }))
    }
}));

jest.unstable_mockModule('../src/logger', () => ({
    DEFAULT_LOGGER: mockLogger,
    wrapLogger: jest.fn((logger) => logger)
}));

jest.unstable_mockModule('../src/util/general', () => ({
    clean: jest.fn(obj => obj)
}));

// Import after mocking
interface ImportedModules {
    create: (options: Options) => Instance;
    Storage: any;
    minorprompt: any;
}

const importModules = async (): Promise<ImportedModules> => {
    const { create } = await import('../src/override');
    const Storage = await import('../src/util/storage');
    const minorprompt = await import('../src/minorPrompt');

    return { create, Storage, minorprompt };
};

describe('override.ts', () => {
    let instance: Instance;
    let modules: ImportedModules;

    beforeEach(async () => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup storage mock for each test
        mockStorageInstance = {
            exists: jest.fn()
        };

        // Import modules with fresh mocks
        modules = await importModules();

        // Create instance with default options
        instance = modules.create({
            configDir: '/test/config',
            overrides: false,
            logger: mockLogger
        });
    });

    describe('override function', () => {
        it('should return empty object when no files exist', async () => {
            // @ts-ignore   
            mockStorageInstance.exists.mockResolvedValue(false);

            const result = await instance.override('test.md', mockSection as any);

            expect(result).toEqual({});
            expect(mockStorageInstance.exists).toHaveBeenCalledTimes(3);
            expect(mockStorageInstance.exists).toHaveBeenCalledWith('/test/config/test.md');
            expect(mockStorageInstance.exists).toHaveBeenCalledWith('/test/config/test-pre.md');
            expect(mockStorageInstance.exists).toHaveBeenCalledWith('/test/config/test-post.md');
        });

        it('should return prepend section when pre file exists', async () => {
            mockStorageInstance.exists
                // @ts-ignore
                .mockImplementation(async (filePath) => filePath.includes('-pre.md'));

            const result = await instance.override('test.md', mockSection as any);

            expect(result).toHaveProperty('prepend', mockSection);
            expect(result).not.toHaveProperty('append');
            expect(result).not.toHaveProperty('override');
        });

        it('should return append section when post file exists', async () => {
            mockStorageInstance.exists
                // @ts-ignore
                .mockImplementation(async (filePath) => filePath.includes('-post.md'));

            const result = await instance.override('test.md', mockSection as any);

            expect(result).toHaveProperty('append', mockSection);
            expect(result).not.toHaveProperty('prepend');
            expect(result).not.toHaveProperty('override');
        });

        it('should throw error when base file exists but overrides disabled', async () => {
            mockStorageInstance.exists
                // @ts-ignore
                .mockImplementation(async (filePath) => !filePath.includes('-pre') && !filePath.includes('-post'));

            await expect(instance.override('test.md', mockSection as any))
                .rejects.toThrow('Core directives are being overwritten by custom configuration, but overrides are not enabled');
        });

        it('should return override section when base file exists and overrides enabled', async () => {
            mockStorageInstance.exists
                // @ts-ignore
                .mockImplementation(async (filePath) => !filePath.includes('-pre') && !filePath.includes('-post'));

            // Create new instance with overrides enabled
            instance = modules.create({
                configDir: '/test/config',
                overrides: true,
                logger: mockLogger
            });

            const result = await instance.override('test.md', mockSection as any);

            expect(result).toHaveProperty('override', mockSection);
            expect(mockLogger.warn).toHaveBeenCalled();
        });

        it('should return all sections when all files exist', async () => {
            // @ts-ignore
            mockStorageInstance.exists.mockResolvedValue(true);

            // Create new instance with overrides enabled
            instance = modules.create({
                configDir: '/test/config',
                overrides: true,
                logger: mockLogger
            });

            const result = await instance.override('test.md', mockSection as any);

            expect(result).toHaveProperty('prepend', mockSection);
            expect(result).toHaveProperty('append', mockSection);
            expect(result).toHaveProperty('override', mockSection);
        });
    });

    describe('customize function', () => {
        it('should return original section when no override files exist', async () => {
            // @ts-ignore
            mockStorageInstance.exists.mockResolvedValue(false);

            const result = await instance.customize('test.md', mockSection as any);

            expect(result).toBe(mockSection);
            expect(modules.minorprompt.Formatter.create).toHaveBeenCalled();
        });

        it('should throw error when base file exists but overrides disabled', async () => {
            mockStorageInstance.exists
                // @ts-ignore
                .mockImplementation(async (filePath) => !filePath.includes('-pre') && !filePath.includes('-post'));

            await expect(instance.customize('test.md', mockSection as any))
                .rejects.toThrow('Core directives are being overwritten by custom configuration, but overrides are not enabled');
        });

        it('should use override when base file exists and overrides enabled', async () => {
            mockStorageInstance.exists
                // @ts-ignore
                .mockImplementation(async (filePath) => !filePath.includes('-pre') && !filePath.includes('-post'));

            // Create new instance with overrides enabled
            instance = modules.create({
                configDir: '/test/config',
                overrides: true,
                logger: mockLogger
            });

            const result = await instance.customize('test.md', mockSection as any);

            expect(result).toBe(mockSection);
            expect(mockLogger.warn).toHaveBeenCalled();
        });

        it('should handle all file types together', async () => {
            // @ts-ignore
            mockStorageInstance.exists.mockResolvedValue(true);

            // Create new instance with overrides enabled
            instance = modules.create({
                configDir: '/test/config',
                overrides: true,
                logger: mockLogger
            });

            const result = await instance.customize('test.md', mockSection as any);

            expect(mockSection.prepend).toHaveBeenCalled();
            expect(mockSection.append).toHaveBeenCalled();
        });
    });
});
