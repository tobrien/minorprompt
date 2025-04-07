import { AreaSeparator, SectionSeparator } from "../src/formatter";
import {
    DEFAULT_AREA_SEPARATOR,
    DEFAULT_SECTION_SEPARATOR,
    DEFAULT_SECTION_INDENTATION,
    DEFAULT_SECTION_TAG,
    DEFAULT_SECTION_TITLE_PROPERTY,
    DEFAULT_PERSONA_ROLE
} from "../src/constants";

describe("constants", () => {
    it("should have correct default area separator", () => {
        expect(DEFAULT_AREA_SEPARATOR).toBe("tag");
    });

    it("should have correct default section separator", () => {
        expect(DEFAULT_SECTION_SEPARATOR).toBe("tag");
    });

    it("should have correct default section indentation", () => {
        expect(DEFAULT_SECTION_INDENTATION).toBe(true);
    });

    it("should have correct default section tag", () => {
        expect(DEFAULT_SECTION_TAG).toBe("section");
    });

    it("should have correct default section title property", () => {
        expect(DEFAULT_SECTION_TITLE_PROPERTY).toBe("title");
    });

    it("should have correct default persona role", () => {
        expect(DEFAULT_PERSONA_ROLE).toBe("developer");
    });
});
