import { Model } from "../src/chat.d";
import { MinorPrompt, Instruction, Content, Context, Persona, WeightedText, Section, Trait } from "../src/minorPrompt.d";
import { Formatter, AreaSeparator, SectionSeparator, SectionTitleProperty, FormatOptions } from "../src/formatter.d";
import { create, format, formatArray, formatPersona } from "../src/formatter";
import { DEFAULT_AREA_SEPARATOR, DEFAULT_SECTION_SEPARATOR, DEFAULT_SECTION_INDENTATION, DEFAULT_SECTION_TITLE_PROPERTY, DEFAULT_SECTION_TITLE_PREFIX, DEFAULT_SECTION_TITLE_SEPARATOR } from "../src/constants";

// Let's create simple mock functions instead of using jest.fn()
const createMockFn = () => function () { return undefined; };

// Create a mock to shim the join method for our tests
const createJoinable = (items: any[]) => {
    const joinable = items;
    joinable.join = (separator: string) => items.map(item => item.text || item).join(separator);
    return joinable;
};

describe("formatter", () => {
    const model: Model = "gpt-4o";

    describe("formatPersona", () => {
        it("should format persona correctly", () => {
            const traits = ["trait1", "trait2"];
            const instructions = ["instruction1", "instruction2"];

            const persona: Persona = {
                name: "TestPersona",
                traits: createJoinable(traits),
                instructions: createJoinable(instructions),
                addTrait: createMockFn(),
                addInstruction: createMockFn()
            };

            const result = formatPersona(model, persona);
            expect(result.role).toBe("system");
            expect(result.content).toBe("trait1\ntrait2\n\ninstruction1\ninstruction2");
        });
    });

    describe("format", () => {
        it("should format simple text correctly", () => {
            const text: WeightedText = { text: "test text", weight: 1 };
            const options: FormatOptions = {
                areaSeparator: DEFAULT_AREA_SEPARATOR,
                sectionSeparator: DEFAULT_SECTION_SEPARATOR,
                sectionIndentation: DEFAULT_SECTION_INDENTATION,
                sectionTitleProperty: DEFAULT_SECTION_TITLE_PROPERTY as SectionTitleProperty,
                sectionTitlePrefix: DEFAULT_SECTION_TITLE_PREFIX,
                sectionTitleSeparator: DEFAULT_SECTION_TITLE_SEPARATOR
            };

            const result = format(text, options);
            expect(result).toBe("test text");
        });

        it("should format section with tag separator correctly", () => {
            const section: Section<WeightedText> = {
                title: "Test Section",
                items: [
                    { text: "item1", weight: 1 },
                    { text: "item2", weight: 1 }
                ],
                add: createMockFn()
            };
            const options: FormatOptions = {
                areaSeparator: DEFAULT_AREA_SEPARATOR,
                sectionSeparator: "tag" as SectionSeparator,
                sectionIndentation: DEFAULT_SECTION_INDENTATION,
                sectionTitleProperty: DEFAULT_SECTION_TITLE_PROPERTY as SectionTitleProperty,
                sectionTitlePrefix: DEFAULT_SECTION_TITLE_PREFIX,
                sectionTitleSeparator: DEFAULT_SECTION_TITLE_SEPARATOR
            };

            const result = format(section, options);
            expect(result).toBe(`<section title="Test Section">\n  item1\n\nitem2\n</section>`);
        });

        it("should format section with markdown separator correctly", () => {
            const section: Section<WeightedText> = {
                title: "Test Section",
                items: [
                    { text: "item1", weight: 1 },
                    { text: "item2", weight: 1 }
                ],
                add: createMockFn()
            };
            const options: FormatOptions = {
                areaSeparator: DEFAULT_AREA_SEPARATOR,
                sectionSeparator: "markdown" as SectionSeparator,
                sectionIndentation: DEFAULT_SECTION_INDENTATION,
                sectionTitleProperty: DEFAULT_SECTION_TITLE_PROPERTY as SectionTitleProperty,
                sectionTitlePrefix: DEFAULT_SECTION_TITLE_PREFIX,
                sectionTitleSeparator: DEFAULT_SECTION_TITLE_SEPARATOR
            };

            const result = format(section, options);
            expect(result).toBe(`#### Section : Test Section\n\nitem1\n\nitem2`);
        });
    });

    describe("formatArray", () => {
        it("should format array of items correctly", () => {
            const items: WeightedText[] = [
                { text: "item1", weight: 1 },
                { text: "item2", weight: 1 }
            ];
            const options: FormatOptions = {
                areaSeparator: DEFAULT_AREA_SEPARATOR,
                sectionSeparator: DEFAULT_SECTION_SEPARATOR,
                sectionIndentation: DEFAULT_SECTION_INDENTATION,
                sectionTitleProperty: DEFAULT_SECTION_TITLE_PROPERTY as SectionTitleProperty,
                sectionTitlePrefix: DEFAULT_SECTION_TITLE_PREFIX,
                sectionTitleSeparator: DEFAULT_SECTION_TITLE_SEPARATOR
            };

            const result = formatArray(items, options);
            expect(result).toBe("item1\n\nitem2");
        });
    });

    describe("create", () => {
        it("should create formatter with default options", () => {
            const formatter = create(model);
            expect(formatter).toBeDefined();
            expect(typeof formatter.format).toBe("function");
        });

        it("should create formatter with custom options", () => {
            const customOptions = {
                areaSeparator: "markdown" as AreaSeparator,
                sectionSeparator: "markdown" as SectionSeparator,
                sectionIndentation: false,
                sectionTitleProperty: "name" as SectionTitleProperty,
                sectionTitlePrefix: "Custom",
                sectionTitleSeparator: " - "
            };

            const formatter = create(model, customOptions);
            expect(formatter).toBeDefined();
            expect(typeof formatter.format).toBe("function");
        });

        it("should format prompt correctly", () => {
            const prompt: MinorPrompt = {
                personas: [{
                    name: "TestPersona",
                    traits: createJoinable([{ text: "trait1", weight: 1 }]),
                    instructions: createJoinable([{ text: "instruction1", weight: 1 }]),
                    addTrait: createMockFn(),
                    addInstruction: createMockFn()
                }],
                instructions: [{ text: "instruction1", weight: 1 } as Instruction],
                contents: [{ text: "content1", weight: 1 } as Content],
                contexts: [{ text: "context1", weight: 1 } as Context],
                addPersona: createMockFn(),
                addInstruction: createMockFn(),
                addContent: createMockFn(),
                addContext: createMockFn()
            };

            const formatter = create(model);
            const result = formatter.format(prompt);
            expect(result.model).toBe(model);
            expect(result.messages.length).toBe(2);
        });
    });
});
