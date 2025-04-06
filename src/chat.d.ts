
export type Role = "user" | "assistant" | "system" | "developer";

export type Model = "gpt-4o" | "gpt-4o-mini" | "o1-preview" | "o1-mini" | "o1" | "o3-mini" | "o1-pro";

export interface Message {
    role: Role;
    content: string | string[];
    name?: string;
}

export interface ChatRequest {
    messages: Message[];
    model: Model;

    addMessage(message: Message): void;
}
