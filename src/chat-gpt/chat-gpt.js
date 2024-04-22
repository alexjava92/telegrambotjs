import {config} from "dotenv";
import {addNewText, getText} from "../database/database.js";
import {logger} from "../logger/logger.js";
import OpenAI from "openai";
import * as path from "path";
import * as fs from "fs";
import {createReadStream} from "fs";
import {OpenAiConfig} from "./configGpt.js";

config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function describeImage(photoFile, chatId, prompt) {
    if(!prompt) {
        prompt = 'Что изображено на фото?'
    }

    try {
        const base64Image = await encodeImageToBase64(photoFile);

        const response = await openai.chat.completions.create({
            model: OpenAiConfig.chat_version,
            messages: [
                {
                    role: 'user',
                    content: [
                        {type: 'text', text: prompt},
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: 'high', // or 'low' for lower resolution
                            },
                        },
                    ],
                },
            ],
            max_tokens: 600,
        });

        const imageDescription = response.choices[0].message.content;
        return imageDescription;
    } catch (error) {
        console.error('Error describing image:', error);
        return null;
    }
}

async function encodeImageToBase64(filePath) {
    const imageBuffer = await fs.promises.readFile(filePath);
    return imageBuffer.toString('base64');
}

export async function generateAudioInText(audioFile) {
    try {
        const audioStream = createReadStream(audioFile);

        logger.API(`Transcribing audio file: ${audioFile}`); // логируем начало транскрибирования аудио

        const transcription = await openai.audio.transcriptions.create({
            file: audioStream,
            model: "whisper-1",

        });
        const text = transcription.text;
        if (!text || text.trim() === '') {
            logger.error('Транскрипция не содержит текста');
            return '';
        }


        logger.API(`Audio transcribed successfully: ${text}`); // логируем успешное транскрибирование аудио
        return text;
    } catch (error) {
        logger.error('Ошибка при транскрибировании аудио:', error); // логируем ошибку транскрибирования аудио
        return '';
    }
}

export async function generateAudio(text) {
    try {
        const audioFile = path.resolve(`./audio/${Date.now()}.opus`);
        logger.API(`Generating audio for text: ${text}`); // логируем начало генерации аудио

        const response = await openai.audio.speech.create({
            model: "tts-1-hd",
            voice: "onyx",
            input: text,
            response_format: 'opus'
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(audioFile, buffer);

        logger.API(`Audio file generated successfully: ${audioFile}`); // логируем успешную генерацию аудио
        return audioFile;
    } catch (error) {
        logger.error("Error generating audio:", error); // логируем ошибку генерации аудио
        return null;
    }
}

export async function generateImage(prompt) {
    try {
        logger.API(`Generating image for prompt: ${prompt}`); // логируем начало генерации изображения
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1, // Количество генерируемых изображений (от 1 до 10)
            size: "1024x1024", // Размер генерируемых изображений (256x256, 512x512, или 1024x1024)
        });

        const imageUrl = response.data[0].url;
        logger.API(`Image generated successfully: ${imageUrl}`); // логируем успешную генерацию изображения
        return imageUrl;
    } catch (error) {
        logger.error("Error generating image:", error.message); // логируем ошибку генерации изображения
        return false;
    }
}

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

/*function createMessageHistory(conversationHistory, prompt) {
    const messageHistory = [
        { role: "system", content: "Ты полезный помощник" },
    ];

    conversationHistory.forEach((entry) => {
        messageHistory.push({ role: "user", content: entry.question });
        messageHistory.push({ role: "assistant", content: entry.answer });
    });

    messageHistory.push({ role: "user", content: prompt });

    return messageHistory;
}*/

export async function chat(prompt, chatId) {
    const conversationHistory = await retrieveConversationHistory(chatId);
    const messageHistory = createMessageHistory(conversationHistory, prompt);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: messageHistory,
        });
        console.log('response', response)
        const answer = response.choices[0].message.content;
        console.log("Длина текста:", answer.length);
        console.log("answer:", answer);
        return answer;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "Ошибка API: не удалось получить ответ.";
    }
}

export const addToHistory = async (question, answer, chatId) => {
    const conversationHistory = await retrieveConversationHistory(chatId);
    const newEntry = {
        question,
        answer,
    };
    conversationHistory.unshift(newEntry);
    await addNewText(chatId, conversationHistory);
};

/*export const askQuestion = async (question, chatId) => {
    try {
        const answer = await chat(question, chatId);
        await addToHistory(question, answer, chatId);
        console.log("Ответ нейронки:", answer);

        return answer;
    } catch (err) {
        logger.error(err);
    }
};*/

/*
export async function chat(prompt, chatId, imageUrl = null) {
    const conversationHistory = await retrieveConversationHistory(chatId);
    const messageHistory = createMessageHistory(conversationHistory, prompt);

    try {
        const messages = [
            ...messageHistory,
            {
                role: "user",
                content: imageUrl
                    ? [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ]
                    : prompt,
            },
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: messages,
        });

        console.log("response", response);
        const answer = response.choices[0].message.content;
        console.log("Длина текста:", answer.length);
        console.log("answer:", answer);
        return answer;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "Ошибка API: не удалось получить ответ.";
    }
}*/

function createMessageHistory(conversationHistory, prompt, imageUrl = null) {
    const messageHistory = [
        {role: "system", content: "Ты полезный помощник"},
    ];

    conversationHistory.forEach((entry) => {
        const questionContent = entry.question && typeof entry.question.trim() === 'string' ? entry.question.trim() : null;
        const answerContent = entry.answer && typeof entry.answer.trim() === 'string' ? entry.answer.trim() : null;

        if (questionContent) {
            messageHistory.push({role: "user", content: questionContent});
        } else {
            logger.warn('Пропущен некорректный вопрос в истории: %s', entry.question);
        }

        if (answerContent) {
            messageHistory.push({role: "assistant", content: answerContent});
        } else {
            logger.warn('Пропущен некорректный ответ в истории: %s', entry.answer);
        }
    });

    let userMessage = {role: "user", content: prompt};
    if (imageUrl) {
        userMessage.content = [
            {type: "text", text: prompt},
            {
                type: "image_url",
                image_url: {
                    url: imageUrl,
                },
            },
        ];
    } else if (prompt && typeof prompt.trim() === 'string') {
        userMessage.content = prompt.trim();
    } else {
        logger.warn('Некорректный новый запрос: %s', prompt);
        userMessage = null;
    }

    if (userMessage) {
        messageHistory.push(userMessage);
    }

    return messageHistory;
}

export const askQuestion = async (question, chatId, imageUrl = null) => {
    try {
        const answer = await chat(question, chatId, imageUrl);
        await addToHistory(question, answer, chatId);
        console.log("Ответ нейронки:", answer);

        return answer;
    } catch (err) {
        logger.error(err);
    }
};
