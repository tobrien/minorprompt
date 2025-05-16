import { describe, expect, it } from '@jest/globals';
import { parseText } from '../../src/parse/text';
import { Weighted } from '../../src/items/weighted';
import { Section } from '../../src/items/section';

describe('parseText', () => {
    it('should create a section with the given title and empty content', () => {
        const result = parseText<Weighted>('', { title: 'Test' });
        expect(result.title).toBe('Test');
        expect(result.items).toHaveLength(0);
    });

    it('should parse a single line into a section with one item', () => {
        const result = parseText<Weighted>('Line 1', { title: 'Test' });
        expect(result.title).toBe('Test');
        expect(result.items).toHaveLength(1);
        expect((result.items[0] as Weighted).text).toBe('Line 1');
        expect((result.items[0] as Weighted).weight).toBe(1.0);
    });

    it('should parse multiple lines into a section with multiple items', () => {
        const result = parseText<Weighted>('Line 1\nLine 2\nLine 3', { title: 'Test' });
        expect(result.title).toBe('Test');
        expect(result.items).toHaveLength(3);
        expect((result.items[0] as Weighted).text).toBe('Line 1');
        expect((result.items[1] as Weighted).text).toBe('Line 2');
        expect((result.items[2] as Weighted).text).toBe('Line 3');
    });

    it('should filter empty lines', () => {
        const result = parseText<Weighted>('Line 1\n\nLine 2\n\n\nLine 3', { title: 'Test' });
        expect(result.items).toHaveLength(3);
    });

    it('should filter whitespace-only lines', () => {
        const result = parseText<Weighted>('Line 1\n   \nLine 2\n\t\nLine 3', { title: 'Test' });
        expect(result.items).toHaveLength(3);
    });

    it('should apply parameters to the text content', () => {
        const parameters = { name: 'John', age: 30, active: true };
        const result = parseText<Weighted>(
            'Name: {{name}}\nAge: {{age}}\nActive: {{active}}',
            { title: 'Test', parameters }
        );
        expect(result.items).toHaveLength(3);
        expect((result.items[0] as Weighted).text).toBe('Name: John');
        expect((result.items[1] as Weighted).text).toBe('Age: 30');
        expect((result.items[2] as Weighted).text).toBe('Active: true');
    });

    it('should use custom itemWeight if provided in options', () => {
        const result = parseText<Weighted>(
            'Line 1\nLine 2',
            { title: 'Test', itemWeight: 2.5 }
        );
        expect((result.items[0] as Weighted).weight).toBe(2.5);
        expect((result.items[1] as Weighted).weight).toBe(2.5);
    });

    it('should use parameters from options if provided', () => {
        const optionsParameters = { global: 'global-value', local: 'local-value' };

        const result = parseText<Weighted>(
            'Global: {{global}}\nLocal: {{local}}',
            { title: 'Test', parameters: optionsParameters }
        );

        expect(result.items).toHaveLength(2);
        // The mainSection is created with global parameters
        expect((result.items[0] as Weighted).text).toBe('Global: global-value');
        // The weighted items within the section use merged parameters when options.parameters exist
        expect((result.items[1] as Weighted).text).toBe('Local: local-value');
    });
});
