/**
 * @jest-environment node
 */
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { type Section } from '../../src/items/section';
import type { Weighted } from '../../src/items/weighted';

// Create a mock function for createWeighted
const mockCreateWeighted = jest.fn();

// Use unstable_mockModule instead of jest.mock
jest.unstable_mockModule('../../src/items/weighted', () => ({
    create: mockCreateWeighted,
    __esModule: true
}));

// Import the module under test - needs to be dynamic import with unstable_mockModule
let create: <T extends Weighted>(title: string) => Section<T>;
let weightedModule: typeof import('../../src/items/weighted');

describe('section', () => {
    beforeEach(async () => {
        // Reset the mock before each test
        mockCreateWeighted.mockReset();
        // Default implementation for the mock
        mockCreateWeighted.mockImplementation((text) => ({ text }));

        // Import the modules under test dynamically after mocking
        const sectionModule = await import('../../src/items/section');
        weightedModule = await import('../../src/items/weighted');
        create = sectionModule.create;
    });

    describe('create', () => {
        it('should create a section with the given title', () => {
            // Arrange
            const title = 'Test Section';

            // Act
            const section = create<Weighted>(title);

            // Assert
            expect(section.title).toBe(title);
            expect(section.items).toEqual([]);
        });

        it('should have an add method', () => {
            // Arrange
            const section = create<Weighted>('Test Section');

            // Assert
            expect(typeof section.add).toBe('function');
        });
    });

    describe('add', () => {
        it('should add an item to the section', () => {
            // Arrange
            const section = create<Weighted>('Test Section');
            const item: Weighted = { text: 'Test Item' };

            // Act
            section.add(item);

            // Assert
            expect(section.items).toContain(item);
        });

        it('should add a section to the section', () => {
            // Arrange
            const parent = create<Weighted>('Parent Section');
            const child = create<Weighted>('Child Section');

            // Act
            parent.add(child);

            // Assert
            expect(parent.items).toContain(child);
        });

        it('should return the section for chaining', () => {
            // Arrange
            const section = create<Weighted>('Test Section');

            // Act
            const result = section.add('Item 1');

            // Assert
            expect(result).toBe(section);
        });

        it('should support chained calls', () => {
            // Arrange
            const section = create<Weighted>('Test Section');

            // Act
            section.add('Item 1');
            section.add('Item 2');
            section.add('Item 3');

            // Assert
            expect(section.items.length).toBe(3);
        });
    });
}); 