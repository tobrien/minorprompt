import * as fs from 'fs/promises';
import { marked } from 'marked';
import { create as createSection, Section } from './items/section';
import { create as createWeighted, Weighted } from './items/weighted';
import { Parameters } from 'items/parameters';

export async function parseFile<T extends Weighted>(filePath: string, options: { weight?: number, parameters?: Parameters } = { weight: 1.0, parameters: {} }): Promise<Section<T>> {
    try {
        const markdownContent = await fs.readFile(filePath, 'utf-8');
        return parse(markdownContent, options);
    } catch (error) {
        // Log the error or handle it appropriately
        // eslint-disable-next-line no-console
        console.error(`Error reading or parsing file with marked at ${filePath}:`, error);
        throw new Error(`Failed to parse instructions from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Reads Markdown content and parses it into a single Section.
 * 
 * - If the content starts with a heading, that becomes the title of the returned Section
 * - If no heading at the start, creates a Section with no title
 * - Headers within the content create nested sections based on their depth
 * - All content is organized in a hierarchical structure based on heading levels
 *
 * @param markdownContent The Markdown content to parse
 * @returns A Section containing all content in a hierarchical structure
 */
export const parse = <T extends Weighted>(markdownContent: string, options: { weight?: number, parameters?: Parameters } = { weight: 1.0, parameters: {} }): Section<T> => {
    // Use marked.lexer to get tokens without full parsing/rendering
    const tokens = marked.lexer(markdownContent);

    // Create the main section (with no title by default)
    const mainSection = createSection<T>('', options);

    // Track sections at each depth level
    const sectionStack: Section<T>[] = [mainSection];

    // Set if we've seen the first token
    let isFirstToken = true;

    for (const token of tokens) {
        switch (token.type) {
            case 'heading': {
                const depth = token.depth;

                // If this is the first token and it's a heading, use it as the main section title
                if (isFirstToken) {
                    mainSection.title = token.text;
                    isFirstToken = false;
                    break;
                }

                isFirstToken = false;

                // Create a new section with this heading
                const newSection = createSection<T>(token.text, options);

                // Ensure the section stack has the right size based on this heading's depth
                // (e.g., a depth-2 heading should be added to the depth-1 section)
                // We need to ensure the stack length is exactly depth, not just less than or equal to depth
                while (sectionStack.length > depth && sectionStack.length > 1) {
                    sectionStack.pop();
                }

                // Make sure we're at the right level for this heading
                // If we stay at the same heading level (e.g., two h2s in sequence),
                // we need to pop once more to get to the parent level
                if (sectionStack.length === depth && sectionStack.length > 1) {
                    sectionStack.pop();
                }

                // Add new section to its parent
                const parentSection = sectionStack[sectionStack.length - 1];
                parentSection.add(newSection);

                // Push this section onto the stack
                sectionStack.push(newSection);
                break;
            }

            case 'paragraph': {
                isFirstToken = false;
                const instruction: T = createWeighted<T>(token.text, options);
                const currentSection = sectionStack[sectionStack.length - 1];
                currentSection.add(instruction);
                break;
            }

            case 'list': {
                isFirstToken = false;
                // Convert list items to instructions
                const listInstructionContent = token.items.map((item: any) => `- ${item.text}`).join('\n');
                const listInstruction: T = createWeighted<T>(listInstructionContent, options);
                const currentSection = sectionStack[sectionStack.length - 1];
                currentSection.add(listInstruction);
                break;
            }

            case 'code': {
                isFirstToken = false;
                // Represent code blocks as instructions
                const codeInstruction: T = createWeighted<T>(`\`\`\`${token.lang || ''}\n${token.text}\n\`\`\``, options);
                const currentSection = sectionStack[sectionStack.length - 1];
                currentSection.add(codeInstruction);
                break;
            }

            case 'space':
                // Usually ignore space tokens between block elements
                break;

            default: {
                isFirstToken = false;
                // Treat other block tokens' text as instructions for robustness
                if ('text' in token && token.text) {
                    const fallbackInstruction: T = createWeighted<T>(token.text, options);
                    const currentSection = sectionStack[sectionStack.length - 1];
                    currentSection.add(fallbackInstruction);
                }
                break;
            }
        }
    }

    return mainSection;
}
