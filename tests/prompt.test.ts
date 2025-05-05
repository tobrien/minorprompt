import { describe, expect, test, jest } from '@jest/globals';
import type { Prompt } from '../src/prompt';
import type { Section } from '../src/items/section';
import type { Instruction } from '../src/items/instruction';
import type { Content } from '../src/items/content';
import type { Context } from '../src/items/context';
import type { Weighted } from '../src/items/weighted';
import { createPrompt, createSection } from 'minorPrompt';

// Create mock functions for create operations
const mockCreateInstruction = jest.fn((text) => ({ text, weight: 1 }));
const mockCreateContent = jest.fn((text) => ({ text, weight: 1 }));
const mockCreateContext = jest.fn((text) => ({ text, weight: 1 }));

// Mock all dependencies
jest.unstable_mockModule('../src/items/content', () => ({
    create: mockCreateContent,
}));

jest.unstable_mockModule('../src/items/context', () => ({
    create: mockCreateContext,
}));

jest.unstable_mockModule('../src/items/instruction', () => ({
    create: mockCreateInstruction,
}));

describe('Prompt', () => {

    beforeEach(async () => {
        // Reset all mocks
        jest.clearAllMocks();
        mockCreateInstruction.mockClear();
        mockCreateContent.mockClear();
        mockCreateContext.mockClear();
    });

    test('should create a prompt with empty arrays', async () => {

        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);

        expect(prompt.persona.items).toEqual([]);
        expect(prompt.instructions.items).toEqual([]);
        expect(prompt.contents.items).toEqual([]);
        expect(prompt.contexts.items).toEqual([]);
    });

    test('should add an instruction from a string', async () => {
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const instructionText = 'Test instruction';

        instructions.add(instructionText);

        // Check that the mock create function was called
        expect(prompt.instructions.items.length).toBe(1);
        expect((prompt.instructions.items[0] as Weighted).text).toBe(instructionText);
    });

    test('should add an instruction object', async () => {
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const instruction = { text: 'Test instruction', weight: 1 };

        instructions.add(instruction);

        expect(prompt.instructions.items).toContain(instruction);
    });

    test('should add an instruction section', async () => {
        const { create } = await import('../src/items/section');
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const section = create('Test Section');

        instructions.add(section);

        expect(prompt.instructions.items).toContain(section);
    });

    test('should add content from a string', async () => {
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const contentText = 'Test content';

        contents.add(contentText);

        // Check that the mock create function was called
        expect(prompt.contents.items.length).toBe(1);
        expect((prompt.contents.items[0] as Weighted).text).toBe(contentText);
    });

    test('should add content object', async () => {
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const content = { text: 'Test content', weight: 1 };

        contents.add(content);

        expect(prompt.contents.items).toContain(content);
    });

    test('should add content section', async () => {
        const { create } = await import('../src/items/section');
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const section = create('Test Section');

        contents.add(section);

        expect(prompt.contents.items).toContain(section);
    });

    test('should add context from a string', async () => {
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const contextText = 'Test context';

        contexts.add(contextText);

        // Check that the mock create function was called
        expect(prompt.contexts.items.length).toBe(1);
        expect((prompt.contexts.items[0] as Weighted).text).toBe(contextText);
    });

    test('should add context object', async () => {
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const context = { text: 'Test context', weight: 1 };

        contexts.add(context);

        expect(prompt.contexts.items).toContain(context);
    });

    test('should add context section', async () => {
        const { create } = await import('../src/items/section');
        const persona = createSection('Persona');
        const instructions = createSection('Instructions');
        const contents = createSection('Contents');
        const contexts = createSection('Contexts');

        const prompt = createPrompt(persona, instructions, contents, contexts);
        const section = create('Test Section');

        contexts.add(section);

        expect(prompt.contexts.items).toContain(section);
    });
});
