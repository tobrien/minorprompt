import { Trait, Instruction, Content, Context, Persona, WeightedText, Section, Instance as MinorPromptInstance } from "../src/minorPrompt";
import {
    createWeightedText,
    createTrait,
    createInstruction,
    createContent,
    createContext,
    createPersona,
    createSection,
    create
} from "../src/minorPrompt";

describe("minorPrompt", () => {
    describe("createWeightedText", () => {
        it("should create a weighted text object with the given text", () => {
            const text = "Test text";
            const result = createWeightedText<Instruction>(text);
            expect(result.text).toBe(text);
        });
    });

    describe("createTrait", () => {
        it("should create a trait object with the given text", () => {
            const text = "Test trait";
            const result = createTrait(text);
            expect(result.text).toBe(text);
        });
    });

    describe("createInstruction", () => {
        it("should create an instruction object with the given text", () => {
            const text = "Test instruction";
            const result = createInstruction(text);
            expect(result.text).toBe(text);
        });
    });

    describe("createContent", () => {
        it("should create a content object with the given text", () => {
            const text = "Test content";
            const result = createContent(text);
            expect(result.text).toBe(text);
        });
    });

    describe("createContext", () => {
        it("should create a context object with the given text", () => {
            const text = "Test context";
            const result = createContext(text);
            expect(result.text).toBe(text);
        });
    });

    describe("createPersona", () => {
        it("should create a persona with name and empty traits/instructions", () => {
            const name = "Test Persona";
            const persona = createPersona(name);

            expect(persona.name).toBe(name);
            expect(persona.traits).toEqual([]);
            expect(persona.instructions).toEqual([]);
        });

        it("should add trait as string", () => {
            const persona = createPersona("Test");
            const trait = "Test trait";
            persona.addTrait(trait);
            expect(persona.traits[0].text).toBe(trait);
        });

        it("should add trait as object", () => {
            const persona = createPersona("Test");
            const trait = createTrait("Test trait");
            persona.addTrait(trait);
            expect(persona.traits[0]).toBe(trait);
        });

        it("should add instruction as string", () => {
            const persona = createPersona("Test");
            const instruction = "Test instruction";
            persona.addInstruction(instruction);
            expect(persona.instructions[0].text).toBe(instruction);
        });

        it("should add instruction as object", () => {
            const persona = createPersona("Test");
            const instruction = createInstruction("Test instruction");
            persona.addInstruction(instruction);
            expect(persona.instructions[0]).toBe(instruction);
        });
    });

    describe("createSection", () => {
        it("should create a section with title and empty items", () => {
            const title = "Test Section";
            const section = createSection<Instruction>(title);

            expect(section.title).toBe(title);
            expect(section.items).toEqual([]);
        });

        it("should add item as string", () => {
            const section = createSection<Instruction>("Test");
            const item = "Test item";
            section.add(item);
            expect(section.items[0].text).toBe(item);
        });

        it("should add item as object", () => {
            const section = createSection<Instruction>("Test");
            const item = createInstruction("Test item");
            section.add(item);
            expect(section.items[0]).toBe(item);
        });
    });

    describe("create", () => {
        it("should create a minor prompt with empty arrays", () => {
            const minorPrompt = create();

            expect(minorPrompt.personas).toEqual([]);
            expect(minorPrompt.instructions).toEqual([]);
            expect(minorPrompt.contents).toEqual([]);
            expect(minorPrompt.contexts).toEqual([]);
        });

        it("should add persona", () => {
            const minorPrompt = create();
            const persona = createPersona("Test");
            minorPrompt.addPersona(persona);
            expect(minorPrompt.personas[0]).toBe(persona);
        });

        it("should add instruction as string", () => {
            const minorPrompt = create();
            const instruction = "Test instruction";
            minorPrompt.addInstruction(instruction);
            expect((minorPrompt.instructions[0] as Instruction).text).toBe(instruction);
        });

        it("should add instruction as object", () => {
            const minorPrompt = create();
            const instruction = createInstruction("Test instruction");
            minorPrompt.addInstruction(instruction);
            expect(minorPrompt.instructions[0]).toBe(instruction);
        });

        it("should add content as string", () => {
            const minorPrompt = create();
            const content = "Test content";
            minorPrompt.addContent(content);
            expect((minorPrompt.contents[0] as Content).text).toBe(content);
        });

        it("should add content as object", () => {
            const minorPrompt = create();
            const content = createContent("Test content");
            minorPrompt.addContent(content);
            expect(minorPrompt.contents[0]).toBe(content);
        });

        it("should add context as string", () => {
            const minorPrompt = create();
            const context = "Test context";
            minorPrompt.addContext(context);
            expect((minorPrompt.contexts[0] as Context).text).toBe(context);
        });

        it("should add context as object", () => {
            const minorPrompt = create();
            const context = createContext("Test context");
            minorPrompt.addContext(context);
            expect(minorPrompt.contexts[0]).toBe(context);
        });
    });
});
