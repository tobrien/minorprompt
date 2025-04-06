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
npm install minor-prompt
```

## Basic Usage

```typescript
import { MinorPrompt, Formatter } from 'minor-prompt';

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
const teacher = MinorPrompt.createPersona("Teacher", "Helpful coding instructor");
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

## Model Support

The initial version of MinorPrompt is designed specifically for the OpenAI API with models such as:
- gpt-4o
- gpt-4o-mini
- o1-mini
- o1
- o3-mini

Future versions will be expanded to support other LLM providers and their respective models.

The formatter automatically adapts the prompt structure based on the model's requirements (e.g., using system messages for models that support them).

## Why the Name?

MinorPrompt is named after the influential hardcore punk band Minor Threat. Just as Minor Threat cut through the noise with their straightforward approach to music, MinorPrompt cuts through the complexity of prompt engineering with a simple, structured approach.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0
