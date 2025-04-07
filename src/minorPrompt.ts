export interface WeightedText {
    text: string;
    weight: number;
}

export interface Instance {
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

export const createWeightedText = <T extends WeightedText>(text: string): T => {
    return {
        text,
    } as T;
}

export const createTrait = (text: string): Trait => {
    return createWeightedText<Trait>(text);
}

export const createInstruction = (text: string): Instruction => {
    return createWeightedText<Instruction>(text);
}

export const createContent = (text: string): Content => {
    return createWeightedText<Content>(text);
}

export const createContext = (text: string): Context => {
    return createWeightedText<Context>(text);
}

export const createPersona = (name: string): Persona => {
    const traits: Trait[] = [];
    const instructions: Instruction[] = [];

    const addTrait = (trait: Trait | string): void => {
        if (typeof trait === 'string') {
            traits.push(createTrait(trait));
        } else {
            traits.push(trait);
        }
    }

    const addInstruction = (instruction: Instruction | string): void => {
        if (typeof instruction === 'string') {
            instructions.push(createInstruction(instruction));
        } else {
            instructions.push(instruction);
        }
    }

    return {
        name,
        traits,
        instructions,
        addTrait,
        addInstruction,
    }
}

export const createSection = <T extends WeightedText>(title: string): Section<T> => {
    const items: T[] = [];

    const add = (item: T | string): void => {
        if (typeof item === 'string') {
            items.push(createWeightedText<T>(item));
        } else {
            items.push(item);
        }
    }

    return {
        title,
        items,
        add,
    }
}

export const create = (): Instance => {
    const personas: Persona[] = [];
    const instructions: (Instruction | Section<Instruction>)[] = [];
    const contents: (Content | Section<Content>)[] = [];
    const contexts: (Context | Section<Context>)[] = [];

    const addPersona = (persona: Persona): void => {
        personas.push(persona);
    }

    const addInstruction = (instruction: Instruction | string | Section<Instruction>): void => {
        if (typeof instruction === 'string') {
            instructions.push(createInstruction(instruction));
        } else {
            instructions.push(instruction);
        }
    }

    const addContent = (content: Content | string | Section<Content>): void => {
        if (typeof content === 'string') {
            contents.push(createContent(content));
        } else {
            contents.push(content);
        }
    }

    const addContext = (context: Context | string | Section<Context>): void => {
        if (typeof context === 'string') {
            contexts.push(createContext(context));
        } else {
            contexts.push(context);
        }
    }

    return {
        personas,
        instructions,
        contents,
        contexts,
        addPersona,
        addInstruction,
        addContent,
        addContext,
    }
}