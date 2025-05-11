# MinorPrompt

A structured prompt engineering library for LLMs - because you have better things to do than worry about prompt formatting.

> "I don't wanna hear it, know you're full of sh*t" - Minor Threat

## Why MinorPrompt?

Tired of spending hours crafting and formatting the perfect LLM prompt? MinorPrompt provides a structured way to organize your prompts, allowing you to focus on the content rather than the formatting.

MinorPrompt helps you:
- Organize prompt elements into logical categories (instructions, content, context)
- Create reusable persona definitions with traits and instructions
- Group related items into sections
- Format everything consistently for different LLM models

## Installation

```bash
npm install @tobrien/minorprompt
```

## Basic Usage

```typescript
import { MinorPrompt, Formatter } from '@tobrien/minorprompt';

// Create a new prompt
const prompt = MinorPrompt.create();

// Add instructions
prompt.addInstruction("Answer in a concise manner");
prompt.addInstruction("Provide code examples when appropriate");

// Add content (what the LLM should respond to)
prompt.addContent("Explain how promises work in JavaScript");

// Add context (background information)
prompt.addContext("This is for a beginner JavaScript tutorial");

// Create a persona
const teacher = MinorPrompt.createPersona("Teacher");
teacher.addTrait("You are a teacher who explains technical concepts in simple terms");
teacher.addTrait("You have 10+ years of experience teaching programming languages");
teacher.addInstruction("Explain concepts using simple analogies");

// Add the persona to the prompt
prompt.addPersona(teacher);

// Format the prompt for a specific model
const formatter = Formatter.create("gpt-4o");
const chatRequest = formatter.format(prompt);

// Use the formatted chat request with your LLM API
```

## Core Concepts

MinorPrompt is built around several key concepts:

### WeightedText

The base type for all prompt elements. Each element has:
- `text`: The actual content
- `weight`: Optional weight value (for potential future ranking/prioritization)

### Prompt Structure Elements

MinorPrompt organizes prompts into four main categories:

1. **Personas**: Define who the LLM should be
   - `name`: The persona's identifier
   - `traits`: Characteristics the persona should embody (e.g., "You are a developer working on a project who needs to create a commit message")
   - `instructions`: Specific guidance for the persona

2. **Instructions**: Tell the LLM how to respond
   - General guidelines for response format, tone, etc.

3. **Content**: What the LLM should respond to
   - The actual query or task

4. **Context**: Provide background information
   - Additional context that helps the LLM understand the request

### Sections

Groups related items together:
- `title`: Section name
- `items`: Collection of related elements

## Advanced Usage

### Creating Sections

```typescript
// Create a section for coding best practices
const bestPractices = MinorPrompt.createSection<MinorPrompt.Instruction>("Best Practices");
bestPractices.add("Follow DRY (Don't Repeat Yourself) principles");
bestPractices.add("Write readable code with clear variable names");
bestPractices.add("Add comments for complex logic");

// Add the section to the prompt
prompt.addInstruction(bestPractices);
```

### Setting Section and Item Weights

MinorPrompt allows you to assign weights to sections and individual items within those sections. This can be useful for future enhancements where prompt elements might be prioritized or selected based on their weight.

You can define `weight` for the section itself and a default `itemWeight` for items added to that section using `SectionOptions`. Additionally, `parameters` can be defined at the section level and will be passed down to items added to that section.

```typescript
// Create a section with specific weights and parameters
const weightedSection = MinorPrompt.createSection<MinorPrompt.Instruction>("Weighted Topics", {
  weight: 10, // Weight for the entire section
  itemWeight: 5, // Default weight for items in this section
  parameters: { topic: "advanced" } // Parameters passed to items
});

// Items added to this section will inherit the itemWeight and parameters
// unless overridden individually.
weightedSection.add("Discuss {{topic}} caching strategies");
weightedSection.add("Explain {{topic}} database indexing", { weight: 7 }); // Override itemWeight

prompt.addInstruction(weightedSection);
```

### Using Parameters for Customization

MinorPrompt supports dynamic content in your prompts through the use of parameters. Parameters allow you to define placeholders in your prompt text (e.g., `{{variable}}`) and replace them with specific values when the prompt is created or formatted. This is a simple yet powerful way to customize prompts for different scenarios without altering the core structure.

Parameters can be passed when creating a prompt, a persona, or a section. They can also be supplied directly when adding individual items like instructions, content, or context if those items are strings with placeholders.

```typescript
// Define a prompt with a placeholder
const dynamicPrompt = MinorPrompt.create();
dynamicPrompt.addInstruction("Translate the following text to {{targetLanguage}}.");
dynamicPrompt.addContent("Hello, world!");

// Format the prompt, providing parameters
const formatter = Formatter.create("gpt-4o");
const chatRequestWithParams = formatter.format(dynamicPrompt, {
  targetLanguage: "Spanish"
});

// The instruction in chatRequestWithParams.messages will be:
// "Translate the following text to Spanish."

// Example with section-level parameters (as shown in the previous section)
const sectionWithParams = MinorPrompt.createSection("Inquiry", {
    parameters: { subject: "history" }
});
sectionWithParams.add("Tell me about the {{subject}} of ancient Rome.");
dynamicPrompt.addContent(sectionWithParams);

const chatRequestWithSectionParams = formatter.format(dynamicPrompt, {
    targetLanguage: "French" // Parameters can be combined
});

// In chatRequestWithSectionParams, the content section will be:
// "Tell me about the history of ancient Rome."
// And the instruction will be:
// "Translate the following text to French."
```

### Parsing Markdown for Section Creation

MinorPrompt can simplify the process of structuring your prompts by parsing Markdown content. When you provide Markdown text, MinorPrompt can automatically convert Markdown headers (e.g., `# Title`, `## Subtitle`) into `Section` objects. The text of the header becomes the title of the `Section`.

This allows you to draft complex prompt structures in a familiar Markdown format and then easily import them into MinorPrompt. For instance, a document like this:

```markdown
# Main Topic
Some general instructions or content.

## Sub-Topic 1
Details about the first sub-topic.

### Sub-Sub-Topic A
Further details.

## Sub-Topic 2
Details about the second sub-topic.
```

Could be parsed into a main section titled "Main Topic" containing text and two sub-sections: "Sub-Topic 1" (which itself contains a nested section "Sub-Sub-Topic A") and "Sub-Topic 2". The content under each header would become items within the respective sections.

_(Note: The specific API for initiating Markdown parsing, e.g., `MinorPrompt.fromMarkdown(markdownString)`, would be detailed in the API documentation or further examples.)_

### Manipulating Section Contents

Once you have a `Section` object, whether created directly, through Markdown parsing, or as part of a `MinorPrompt` instance (e.g., `prompt.instructionsSection`), you have several methods to manage its contents. These methods allow for dynamic construction and modification of your prompt structure.

The `Section` interface provides the following methods for item manipulation:

- **`add(item: T | Section<T> | string, options?: WeightedOptions): Section<T>`**
  Appends a new item or a nested section to the end of the section's item list. If a string is provided, it's typically converted into an appropriate `WeightedText` object (e.g., `Instruction`, `ContentText`).
  ```typescript
  mySection.add("New item at the end");
  const nestedSection = MinorPrompt.createSection("Nested");
  mySection.add(nestedSection);
  ```

- **`append(item: T | Section<T> | string, options?: WeightedOptions): Section<T>`**
  Alias for `add`. Appends an item or nested section to the end.
  ```typescript
  mySection.append("Another item at the end");
  ```

- **`prepend(item: T | Section<T> | string, options?: WeightedOptions): Section<T>`**
  Adds a new item or a nested section to the beginning of the section's item list.
  ```typescript
  mySection.prepend("Item at the very beginning");
  ```

- **`insert(index: number, item: T | Section<T> | string, options?: WeightedOptions): Section<T>`**
  Inserts an item or nested section at a specific zero-based `index` within the item list.
  ```typescript
  mySection.insert(1, "Item at index 1"); // Inserts after the first item
  ```

- **`replace(index: number, item: T | Section<T> | string, options?: WeightedOptions): Section<T>`**
  Replaces the item at the specified `index` with a new item or nested section.
  ```typescript
  mySection.replace(0, "Replaced first item");
  ```

- **`remove(index: number): Section<T>`**
  Removes the item at the specified `index` from the item list.
  ```typescript
  mySection.remove(0); // Removes the first item
  ```

These methods return the `Section` instance itself, allowing for fluent chaining of operations:

```typescript
mySection
  .add("First item")
  .prepend("Actually, this is first")
  .insert(1, "This goes second")
  .remove(2); // Removes "First item"
```

### Customizing Format Options

```typescript
// Create a formatter with custom formatting options
const formatter = Formatter.create("gpt-4o", {
  areaSeparator: "markdown",
  sectionSeparator: "markdown",
  sectionIndentation: true,
  sectionTitlePrefix: "Topic",
  sectionTitleSeparator: " - "
});
```

MinorPrompt supports various formatting styles to organize your prompt elements:

#### Available Formatting Options

- **areaSeparator**: Determines how major areas (Instructions, Content, Context) are formatted
  - `"tag"`: Uses XML-style tags `<instructions>...</instructions>`
  - `"markdown"`: Uses markdown headers `#### Instructions`

- **sectionSeparator**: Determines how sections within areas are formatted
  - `"tag"`: Uses XML-style tags `<section title="Best Practices">...</section>`
  - `"markdown"`: Uses markdown subheaders `#### Section : Best Practices`

#### Examples of Different Separator Styles

Here's how the same prompt would be formatted using different separator styles:

**Tag Style (Default)**

```
<instructions>
  Answer in a concise manner
  Provide code examples when appropriate
  
  <section title="Best Practices">
    Follow DRY (Don't Repeat Yourself) principles
    Write readable code with clear variable names
    Add comments for complex logic
  </section>
</instructions>

<contents>
  Explain how promises work in JavaScript
</contents>

<context>
  This is for a beginner JavaScript tutorial
</context>
```

**Markdown Style**

```
#### Instructions

Answer in a concise manner
Provide code examples when appropriate

#### Section : Best Practices

Follow DRY (Don't Repeat Yourself) principles
Write readable code with clear variable names
Add comments for complex logic

#### Contents

Explain how promises work in JavaScript

#### Context

This is for a beginner JavaScript tutorial
```

Different LLM providers have different recommendations for prompt formatting:

- **Anthropic (Claude)** generally recommends using XML-style tags to clearly delineate sections of prompts
- **OpenAI (GPT)** models work well with both markdown-style formatting and XML tags

The field of prompt engineering is rapidly evolving, with new research and best practices emerging regularly. MinorPrompt's flexible formatting system allows you to adapt to these changes without rewriting your prompts entirely.

By separating the structure of your prompt (instructions, context, content) from its formatting, MinorPrompt makes it easier to experiment with different formatting approaches to find what works best for your specific use case and model.

## Model Support

The initial version of MinorPrompt is designed specifically for the OpenAI API with models such as:
- gpt-4o
- gpt-4o-mini
- o1-mini
- o1
- o1-preview
- o1-pro
- o3-mini

Future versions will be expanded to support other LLM providers and their respective models.

The formatter automatically adapts the prompt structure based on the model's requirements (e.g., using system messages for models that support them).

## Why the Name?

MinorPrompt is named after the influential hardcore punk band Minor Threat. Just as Minor Threat cut through the noise with their straightforward approach to music, MinorPrompt cuts through the complexity of prompt engineering with a simple, structured approach.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0
