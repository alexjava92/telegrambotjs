import * as fs from "fs";
import path from "path";
import {promisify} from "util";
import {pipeline} from "stream";
import {addToHistory, describeImage} from "../../chat-gpt/chat-gpt.js";
import {logger} from "../../logger/logger.js";


/*export async function handlePhoto(msg, bot) {
    const {chat: {id: chatId}, photo, caption} = msg;
    const fileId = photo[photo.length - 1].file_id;
    const prompt = caption;
    const photosDir = './photo';
    let filePath;

    logger.info(`Получено новое фото от пользователя: ${msg.from.first_name} ${msg.from.last_name}`);
    logger.info(`Запрос: ${prompt}`);

    try {
        if (!fs.existsSync(photosDir)) {
            fs.mkdirSync(photosDir);
            logger.info(`Создана директория: ${photosDir}`);
        }

        const file = await bot.getFile(fileId);
        const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        logger.info(`Ссылка на файл: ${fileLink}`);

        const response = await fetch(fileLink);
        const fileName = path.basename(file.file_path);
        filePath = `${photosDir}/${fileName}`;

        await promisify(pipeline)(
            response.body,
            fs.createWriteStream(filePath)
        );
        const message = await bot.sendMessage(chatId, `Изучаю фото...`);
        logger.info(`Файл сохранен: ${filePath}`);
        const imageDescription = await describeImage(filePath, chatId, prompt);
        await bot.sendMessage(chatId, `Описание изображения: ${imageDescription}`);
        await bot.deleteMessage(chatId, message.message_id);
        await addToHistory(prompt, imageDescription, chatId)
    } catch (error) {
        logger.error(`Ошибка при обработке фото: ${error.message}`);
        if (error.response && error.response.body) {
            logger.error(`Ошибка Telegram API: ${error.response.body}`);
        }
        await bot.sendMessage(chatId, 'Произошла ошибка при обработке фотографии.');
    } finally {
        // Удаление файла фотографии после успешного или неуспешного ответа
        if (filePath) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    logger.error(`Ошибка удаления файла: ${err.message}`);
                } else {
                    logger.info(`Файл удален: ${filePath}`);
                }
            });
        }
    }
}*/

const photosDir = './photo';

async function createDirectoryIfNotExists() {
    if (!fs.existsSync(photosDir)) {
        fs.mkdirSync(photosDir);
        logger.info(`Создана директория: ${photosDir}`);
    }
}

async function downloadAndSavePhoto(fileId, bot) {
    const file = await bot.getFile(fileId);
    const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
    logger.info(`Ссылка на файл: ${fileLink}`);

    const response = await fetch(fileLink);
    const fileName = path.basename(file.file_path);
    const filePath = `${photosDir}/${fileName}`;

    await promisify(pipeline)(
        response.body,
        fs.createWriteStream(filePath)
    );

    logger.info(`Файл сохранен: ${filePath}`);
    return filePath;
}

async function sendPhotoDescriptionAndAddToHistory(chatId, prompt, imageDescription, bot) {
    console.log(imageDescription)
    await bot.sendMessage(chatId, imageDescription, { parse_mode: 'Markdown' });
    await addToHistory(prompt, imageDescription, chatId);
}

async function handlePhotoError(chatId, error, bot) {
    logger.error(`Ошибка при обработке фото: ${error.message}`);
    if (error.response && error.response.body) {
        logger.error(`Ошибка Telegram API: ${error.response.body}`);
    }
    await bot.sendMessage(chatId, 'Произошла ошибка при обработке фотографии.');
}

async function deletePhotoFile(filePath) {
    if (filePath) {
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.error(`Ошибка удаления файла: ${err.message}`);
            } else {
                logger.info(`Файл удален: ${filePath}`);
            }
        });
    }
}

export async function handlePhoto(msg, bot) {
    const { chat: { id: chatId }, photo, caption } = msg;
    const fileId = photo[photo.length - 1].file_id;
    const prompt = caption;
    let filePath;

    logger.info(`Получено новое фото от пользователя: ${msg.from.first_name}`);
    logger.info(`Запрос: ${prompt}`);

    try {
        const message = await bot.sendMessage(chatId, `Изучаю фото...`);
        await createDirectoryIfNotExists();
        filePath = await downloadAndSavePhoto(fileId, bot); // Присваиваем значение внешней переменной filePath
        const imageDescription = await describeImage(filePath, chatId, prompt);
        await bot.deleteMessage(chatId, message.message_id);
        await sendPhotoDescriptionAndAddToHistory(chatId, prompt, imageDescription, bot);
    } catch (error) {
        await handlePhotoError(chatId, error, bot);
    } finally {
        await deletePhotoFile(filePath); // Используем внешнюю переменную filePath
    }
}
