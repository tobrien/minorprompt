import { AreaSeparator, FormatOptions, SectionSeparator } from "./formatter.d";

export const DEFAULT_AREA_SEPARATOR: AreaSeparator = "tag";
export const DEFAULT_SECTION_SEPARATOR: SectionSeparator = "tag";
export const DEFAULT_SECTION_INDENTATION = true;
export const DEFAULT_SECTION_TAG = "section";
export const DEFAULT_SECTION_TITLE_PROPERTY = "title";
export const DEFAULT_SECTION_TITLE_PREFIX = "Section";
export const DEFAULT_SECTION_TITLE_SEPARATOR = " : ";

export const DEFAULT_PERSONA_ROLE = "developer";

export const DEFAULT_INSTRUCTIONS_AREA_TITLE = "Instructions";
export const DEFAULT_CONTENTS_AREA_TITLE = "Contents";
export const DEFAULT_CONTEXT_AREA_TITLE = "Context";

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
    areaSeparator: DEFAULT_AREA_SEPARATOR,
    sectionSeparator: DEFAULT_SECTION_SEPARATOR,
    sectionIndentation: DEFAULT_SECTION_INDENTATION,
    sectionTitleProperty: DEFAULT_SECTION_TITLE_PROPERTY,
    sectionTitlePrefix: DEFAULT_SECTION_TITLE_PREFIX,
    sectionTitleSeparator: DEFAULT_SECTION_TITLE_SEPARATOR,
}