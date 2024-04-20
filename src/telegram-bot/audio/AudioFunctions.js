import ffmpeg from "fluent-ffmpeg";
import {askQuestion, generateAudio, generateAudioInText} from "../../chat-gpt/chat-gpt.js";
import {promisify} from "util";
import {unlink} from "fs";
import {logger} from "../../logger/logger.js";

export const convertAudioToMP3 = (inputFile) => {
    return new Promise((resolve, reject) => {
        const outputFile = `${inputFile.split('.')[0]}.mp3`;
        ffmpeg(inputFile)
            .audioCodec('libmp3lame')
            .outputOptions(['-qscale:a 2'])
            .output(outputFile)
            .on('end', () => resolve(outputFile))
            .on('error', (err) => reject(err))
            .run();
    });
};

export const transcribeAudio = async (mp3FilePath, chatId, bot) => {
    // Вызовите функцию generateAudioInText с необходимыми параметрами
    const result = await generateAudioInText(mp3FilePath, chatId, bot);
    return result;
};

export const getAnswerFromOpenAI = async (transcription, chatId) => {
    // Вызовите функцию askQuestion с необходимыми параметрами
    const answer = await askQuestion(transcription, chatId);
    return answer;
};

export const generateAudioFromText = async (text) => {
    // Вызовите функцию generateAudio с необходимым параметром
    const audio = await generateAudio(text);
    return audio;
};

export const deleteTemporaryFiles = async (tempFilePath, mp3FilePath) => {
    try {
        await promisify(unlink)(tempFilePath);
        logger.info(`Временный файл ${tempFilePath} удален`);
    } catch (err) {
        logger.error(`Ошибка при удалении временного файла: ${err}`);
    }

    try {
        await promisify(unlink)(mp3FilePath);
        logger.info(`MP3 файл ${mp3FilePath} удален`);
    } catch (err) {
        logger.error(`Ошибка при удалении MP3 файла: ${err}`);
    }
};