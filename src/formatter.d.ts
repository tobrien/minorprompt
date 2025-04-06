import { MinorPrompt } from "./minorPrompt.d";
import { ChatRequest } from "./chat.d";

export type AreaSeparator = "tag" | "markdown";
export type SectionSeparator = "tag" | "markdown";
export type SectionTitleProperty = "title" | "name";

export interface Formatter {
    format(prompt: MinorPrompt): ChatRequest;
}

export interface FormatOptions {
    areaSeparator: AreaSeparator;
    sectionSeparator: SectionSeparator;
    sectionIndentation: boolean;
    sectionTitleProperty: SectionTitleProperty;
    sectionTitlePrefix: string;
    sectionTitleSeparator: string;
}