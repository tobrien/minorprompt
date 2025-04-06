export interface WeightedText {
    text: string;
    weight: number;
}

export interface MinorPrompt {
    personas: Persona[];
    instructions: (Instruction | Section<Instruction>)[];
    contents: (Content | Section<Content>)[];
    contexts: (Context | Section<Context>)[];

    addPersona(persona: Persona): void;
    addInstruction(instruction: Instruction | string | Section<Instruction>, options?: { section?: string }): void;
    addContent(content: Content | string | Section<Content>, options?: { section?: string }): void;
    addContext(context: Context | string | Section<Context>, options?: { section?: string }): void;
}

export interface Persona {
    name: string;
    traits: Trait[];
    instructions: Instruction[];

    addTrait(trait: Trait | string): void;
    addInstruction(instruction: Instruction | string): void;
}

export type Trait = WeightedText;

export type Instruction = WeightedText;

export type Content = WeightedText;

export type Context = WeightedText;

export interface Section<T extends WeightedText> {
    title: string;
    items: T[];

    add(item: T | string): void;
}