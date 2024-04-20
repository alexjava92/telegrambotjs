import {generateImage} from "../../chat-gpt/chat-gpt.js";
import {generateAudioFromText, getAnswerFromOpenAI} from "./AudioFunctions.js";
import {logger} from "../../logger/logger.js";
import * as fs from "fs";

export async function processUserInput(transcription, bot, chatId) {
    if (transcription.startsWith('Нарисуй')) {
        const drawingMessage = await bot.sendMessage(chatId, "Рисую для тебя....");
        const prompt = transcription.slice(8); // Извлекаем prompt из текста после слова "нарисуй"
        const imageUrl = await generateImage(prompt);

        if (imageUrl) {
            await bot.sendPhoto(chatId, imageUrl);
            await bot.deleteMessage(chatId, drawingMessage.message_id);
        } else {
            await bot.sendMessage(chatId, 'Извините, произошла ошибка при генерации изображения.');
        }
    } else {
        const message = await bot.sendMessage(chatId, 'Ответ формируется...');
        const statusMessageId = message.message_id;
        const answer = await getAnswerFromOpenAI(transcription, chatId);
        const audioFile = await generateAudioFromText(answer);

        await bot.sendMessage(chatId, answer, {
            parse_mode: 'Markdown'
        });
        await bot.sendAudio(chatId, audioFile);

        try {
            await bot.deleteMessage(chatId, statusMessageId);
            logger.info(`Сообщение 'Ответ формируется...' было удалено`);
        } catch (err) {
            logger.error(`Ошибка при удалении сообщения 'Ответ формируется...': ${err}`);
        }

        if (audioFile) {
            try {
                await fs.promises.unlink(audioFile);
                logger.info(`Аудиофайл удален после успешного ответа: ${audioFile}`);
            } catch (err) {
                logger.error(`Ошибка удаления аудиофайла после успешного ответа: ${err}`);
            }
        }
    }
}