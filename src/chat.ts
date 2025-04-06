import { Message, ChatRequest, Model, Role } from "./chat.d";

import { DEFAULT_PERSONA_ROLE } from "./constants";

export const getPersonaRole = (model: Model): Role => {
    if (model === "gpt-4o" || model === "gpt-4o-mini") {
        return "system";
    }
    return DEFAULT_PERSONA_ROLE;
}

export const createChatRequest = (model: Model): ChatRequest => {
    const messages: Message[] = [];

    return {
        model,
        messages,
        addMessage: (message: Message) => {
            messages.push(message);
        }
    }
}
