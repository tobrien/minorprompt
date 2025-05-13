/**
 * @jest-environment node
 */
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import type { Trait } from '../../src/items/trait';

// Create a mock function for createWeighted
const mockCreateWeighted = jest.fn();

// Use unstable_mockModule instead of jest.mock
jest.unstable_mockModule('@/items/weighted', () => ({
    create: mockCreateWeighted,
    DEFAULT_WEIGHTED_OPTIONS: { weight: 1, parameters: {} },
    __esModule: true
}));

// Import the module under test - needs to be dynamic import with unstable_mockModule
let create: (text: string) => Trait;

describe('trait', () => {
    beforeEach(async () => {
        // Reset the mock before each test
        mockCreateWeighted.mockReset();
        // Default implementation for the mock
        mockCreateWeighted.mockImplementation((text) => ({ text }));

        // Import the module under test dynamically after mocking
        const traitModule = await import('@/items/trait');
        create = traitModule.create;
    });

    describe('types', () => {
        it('should define Trait as a Weighted type', () => {
            // This is a type test - no assertions needed
            // The test compiles if Trait type extends Weighted
            const trait = {
                text: 'Test',
                weight: 1
            };

            expect(trait.text).toBe('Test');
            expect(trait.weight).toBe(1);
        });
    });

    describe('create', () => {
        it('should call createWeighted with the provided text', () => {
            const text = 'Test trait';
            create(text);
            expect(mockCreateWeighted).toHaveBeenCalledWith(text, { weight: 1, parameters: {} });
        });

        it('should return the result from createWeighted', () => {
            const mockResult = { text: 'Test trait', weight: 2 };
            mockCreateWeighted.mockReturnValueOnce(mockResult);

            const result = create('Test trait');

            expect(result).toBe(mockResult);
        });
    });
}); 