// Пример использования
import {textToSpeech} from "../chat-gpt/chat-gpt.js";
import * as fs from "fs";

const text = "Привет, меня зовут Клод, и я - искусственный интеллект.";
const voiceId = "alloy"; // Можно использовать другие голоса: echo, fable, onyx, nova, shimmer

textToSpeech(text, voiceId)
    .then((audioData) => {
        if (audioData) {
            const audioPath = "./output.mp3";
            fs.writeFileSync(audioPath, audioData);
            console.log(`Аудиофайл сохранен: ${audioPath}`);
        } else {
            console.log("Не удалось сгенерировать аудио.");
        }
    })
    .catch((error) => {
        console.error("Ошибка:", error);
    });