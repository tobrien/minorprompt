import { Message, Model, Role } from "../src/chat.d";
import { getPersonaRole, createChatRequest } from "../src/chat";

describe("chat", () => {
    describe("getPersonaRole", () => {
        it("should return 'system' for gpt-4o model", () => {
            const model: Model = "gpt-4o";
            const result = getPersonaRole(model);
            expect(result).toBe("system");
        });

        it("should return 'system' for gpt-4o-mini model", () => {
            const model: Model = "gpt-4o-mini";
            const result = getPersonaRole(model);
            expect(result).toBe("system");
        });

        it("should return default role for other models", () => {
            const models: Model[] = ["o1-preview", "o1-mini", "o1", "o3-mini", "o1-pro"];
            models.forEach(model => {
                const result = getPersonaRole(model);
                expect(result).toBe("developer");
            });
        });
    });

    describe("createChatRequest", () => {
        it("should create a chat request with empty messages array", () => {
            const model: Model = "gpt-4o";
            const chatRequest = createChatRequest(model);

            expect(chatRequest.model).toBe(model);
            expect(chatRequest.messages).toEqual([]);
        });

        it("should add messages to the chat request", () => {
            const model: Model = "gpt-4o";
            const chatRequest = createChatRequest(model);

            const message1: Message = {
                role: "user",
                content: "Hello"
            };

            const message2: Message = {
                role: "assistant",
                content: "Hi there!"
            };

            chatRequest.addMessage(message1);
            chatRequest.addMessage(message2);

            expect(chatRequest.messages).toEqual([message1, message2]);
        });
    });
});
