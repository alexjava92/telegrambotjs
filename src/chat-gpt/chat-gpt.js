import { config } from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { addNewText, getText } from "../database/database.js";
import { logger } from "../logger/logger.js";

config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function retrieveConversationHistory(chatId) {
    let massText = await getText(chatId);
    let conversationHistory = [];

    try {
        if (massText !== null && massText[0] !== null && massText[0].messaget_text !== null) {
            const conversationHistoryJSON = massText[0].messaget_text;
            conversationHistory = JSON.parse(conversationHistoryJSON);
        }
    } catch (error) {
        logger.error("Ошибка при получении истории разговора:", error);
        conversationHistory = [];
    }

    return conversationHistory;
}

function createMessageHistory(conversationHistory, prompt) {
    const messageHistory = [
        { role: "system", content: "Ты полезный помощник" },
    ];

    conversationHistory.forEach((entry) => {
        messageHistory.push({ role: "user", content: entry.question });
        messageHistory.push({ role: "assistant", content: entry.answer });
    });

    messageHistory.push({ role: "user", content: prompt });

    return messageHistory;
}

export async function chat(prompt, chatId) {
    const conversationHistory = await retrieveConversationHistory(chatId);
    const messageHistory = createMessageHistory(conversationHistory, prompt);

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: messageHistory,
        });

        const answer = response.data.choices[0].message.content;
        console.log("Длина текста:", answer.length);
        return answer;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "Ошибка API: не удалось получить ответ.";
    }
}

const addToHistory = async (question, answer, chatId) => {
    const conversationHistory = await retrieveConversationHistory(chatId);
    const newEntry = {
        question,
        answer,
    };
    conversationHistory.unshift(newEntry);
    await addNewText(chatId, conversationHistory);
};

export const askQuestion = async (question, chatId) => {
    try {
        const answer = await chat(question, chatId);
        await addToHistory(question, answer, chatId);
        console.log("Ответ нейронки:", answer);

        return answer;
    } catch (err) {
        logger.error(err);
    }
};
