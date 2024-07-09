import {logger} from "../../logger/logger.js";
import {checkingYourSubscription, exist} from "../botLogic.js";
import {
    addStatus,
    deleteGetText, getResponseCount,
    getStatus,
    getStatusOne,
    getUserDetailsFromDB,
    resetResponseCount, setResponseCount,
} from "../../database/database.js";
import {addToHistory, askQuestion, generateAudio, generateImage} from "../../chat-gpt/chat-gpt.js";

import {bot} from "../index.js";
import moment from "moment-timezone";
import {displayCardInfo} from "../../BinChecker/BinChecker.js";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import {promisify} from 'util';
import {createWriteStream, unlink} from "fs";
import {pipeline} from 'stream';
import {token} from "../config/Config.js";
import {
    convertAudioToMP3, deleteTemporaryFiles,
    transcribeAudio
} from "../audio/AudioFunctions.js";
import {processUserInput} from "../audio/ProcessUserInput.js";
import {User} from "../../Users/User.js";
import {Profile} from "../profile/Profile.js";


const ffmpegPath = ffmpegInstaller.path;
ffmpeg.setFfmpegPath(ffmpegPath);


const keyboardMenu = {
    reply_markup: {
        keyboard: [
            [
                {
                    text: 'Завершить диалог',

                },
                {
                    text: '👤Профиль',
                    callback_data: 'show_profile',

                },
            ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
}
let statusUserFinal;
let status_1;

const usersState = new Map(); // Для хранения состояния пользователей


//обрезает и отправляет сообщение если текст больше 4к символов
async function sendMessageInChunks(chatId, text) {
    // Ваш код для разбиения сообщения и отправки его по частям
    const maxMessageLength = 4000;
    const textLength = text.length;

    if (textLength <= maxMessageLength) {
        await bot.sendMessage(chatId, text, {
            parse_mode: 'Markdown'
        });
    } else {
        let startIndex = 0;
        let endIndex = maxMessageLength;

        while (startIndex < textLength) {
            const messageChunk = text.slice(startIndex, endIndex);
            await bot.sendMessage(chatId, messageChunk);

            startIndex += maxMessageLength;
            endIndex += maxMessageLength;
        }
    }
}

export async function handleUserMessage(msg) {
    const {
        message_id,
        chat: {id: chatId, first_name, username, type},
        text: messageText,
        photo, sticker, document,
    } = msg;


    const st = await getStatusOne(chatId);
    status_1 = st[0].column_status_1;

    return status_1 === "yes_subscription";
}

export async function handleText(msg, bot) {

    const {
        message_id,
        chat: {id: chatId, first_name, username, type},
        text: messageText,
    } = msg;

    // Получили пользователя
    let user;
    user = await User.getUser(chatId);
    if (!user) {
        await exist(chatId, username, first_name, messageText);
        user = await User.getUser(chatId);
    }
    console.log(user)
    logger.info(`[Пользователь: ${user.firstName} Отправил текст: ${messageText} message_id: ${message_id}]`);


    if (messageText === "/start") {
        if (await handleUserMessage(msg)) {
            await addStatus(chatId, "start_dialog");
            await deleteGetText(chatId);
            usersState.set(chatId, false);


            const welcomeMessage =
                "👋 Добро пожаловать " +
                first_name +
                ", я немного расскажу как пользоваться ботом. \n" +
                "\nДля начала общение с нейронной сетью напишите свой вопрос.\n" +
                "\nЧто бы сбросить историю диалога нажмите \"Завершить диалог\" " +
                "это отчистит историю диалога и память нейронной сети.";

            await bot.sendMessage(chatId, welcomeMessage, keyboardMenu);
            return;
        }
    } else if (messageText === "👤Профиль") {
        const chatId = msg.chat.id;
        const user = await User.getUser(chatId);
        await Profile(user);

    } else if (messageText === "Завершить диалог") {
        if (await handleUserMessage(msg)) {
            await bot.sendMessage(chatId, "История диалога успешно сброшена!");
            await deleteGetText(chatId);
        }
    } else if (messageText.startsWith('/image') || messageText.startsWith('нарисуй') || messageText.startsWith('Нарисуй')) {
        const commandEnd = messageText.indexOf(' ') + 1;
        const prompt = messageText.slice(commandEnd);
        logger.info(`prompt: ${prompt}`)

        try {
            const sentMessage = await bot.sendMessage(chatId, "рисую... 5 - 15 секунд!");
            const messageId = sentMessage.message_id;

            const imageUrl = await generateImage(prompt, chatId);
            await addToHistory(prompt, imageUrl, chatId);

            if (imageUrl) {
                await bot.sendPhoto(chatId, imageUrl, {
                    parse_mode: 'Markdown'
                });
                await bot.deleteMessage(chatId, messageId); // Удаляем сообщение "рисую..."
            } else {
                await bot.deleteMessage(chatId, messageId); // Удаляем сообщение "рисую..."
                await bot.sendMessage(chatId, 'Произошла ошибка при генерации изображения. Измените запрос');
            }
        } catch (error) {
            console.error("Error generating image:", error.message);
        }
    } else if (messageText.startsWith('/voice')) {
        try {
            const text = messageText.slice(6); // Получаем текст для конвертации в аудио
            const audioFilePath = await generateAudio(text);

            if (audioFilePath) {
                await bot.sendAudio(chatId, audioFilePath);
            } else {
                await bot.sendMessage(chatId, 'Произошла ошибка при генерации аудио. Пожалуйста, попробуйте еще раз.');
            }
        } catch (error) {
            console.error('Error generating audio:', error.message);
            await bot.sendMessage(chatId, 'Произошла ошибка при генерации аудио. Пожалуйста, попробуйте еще раз.');
        }
    } /*else if (messageText === "Начать диалог") {
        if (await handleUserMessage(msg)) {
            await bot.sendMessage(chatId, "Диалог успешно начат!\nТеперь можете спросить меня о чем угодно...");
            await addStatus(chatId, "start_dialog");
        }
        //проверка карт /card 5536 9139 0670 5666
    }*/ else if (messageText.startsWith("/card")) {

        const cardPattern = /\/card\s*((\d{4}[\s\-]?){1,3}\d{2,4}|(\d{4}[\s\-]?){3}\d{4})/;

        const cardMatch = messageText.match(cardPattern);
        if (cardMatch) {
            const cardNumber = cardMatch[0].replace(/\/card\s+|\s|-/g, ''); // Убираем "/card ", пробелы и дефисы
            await addStatus(chatId, "card_check");
            await bot.sendMessage(chatId, `Данные карты: ${cardNumber}`);

            const resultCardInfo = await displayCardInfo(cardNumber, chatId)
            await bot.sendMessage(chatId, `${resultCardInfo}`);
            return;
        } else {
            await bot.sendMessage(chatId, `🔴 Не верно указана карта.`);
            return;
        }

    } else {


        const st = await getStatusOne(chatId);
        status_1 = st[0].column_status_1;
        let statusUser;
        const result = await getStatus(chatId);
        console.log(result);
        statusUser = result[0].column_status;
        console.log("Проверяю статус: " + statusUser);
        statusUserFinal = statusUser;

        logger.info(`status_1 ${status_1}`)
        logger.info(`statusUserFinal ${statusUserFinal}`)

        if (statusUser === "payment_amount") {
            const amount = parseFloat(messageText);

            if (isNaN(amount)) {
                await bot.sendMessage(chatId, "Пожалуйста, укажите сумму пополнения в виде числа.");
            } else if (amount < 200 || amount > 300000) {
                await bot.sendMessage(chatId, "Пожалуйста, укажите сумму в диапазоне от 200 до 300000.");
            } else {
                const options = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{text: '💳 Оплата картой', callback_data: 'buy_subscription2'}],
                            [{text: 'Оплата crypto', callback_data: 'buy_subscription_crypto'}]
                        ]
                    }
                };

                await bot.sendMessage(chatId, `Отлично, пополним ваш баланс на ${amount} руб.`, options);
                const user = await User.getUser(chatId);
                await user.setPaymentAmount(amount);
                await user.setUserStatus('start_dialog');
            }
        }

        if (status_1 === "yes_subscription") {
            try {
                if (statusUserFinal === "start_dialog") {
                    try {
                        await checkingYourSubscription(user.chatId);
                        // Здесь вызываем нашу функцию проверки пользователя и подписки
                        const canProceed = await handleUserRequest(user.chatId);
                        if (!canProceed) return; // Если пользователь исчерпал лимит, мы завершаем обработку
                        // Обработка обычных текстовых сообщений
                        // Проверяем состояние пользователя
                        if (usersState.get(chatId)) {
                            console.log("Пользователь ожидает ответа, не отправляем новое сообщение.");
                            await bot.sendMessage(chatId, 'Дождитесь пожалуйста ответа 😊, а потом задавайте следующий вопрос.')
                            return;
                        }
                        // Устанавливаем состояние пользователя как ожидающего ответа
                        usersState.set(chatId, true);


                        const sentMessage = await bot.sendMessage(chatId, "📝 GPT печатает... от 5 сек до 1 минуты могут формироваться ответы");
                        const messageId = sentMessage.message_id;
                        let text = await askQuestion(msg.text, chatId);

                        await bot.deleteMessage(chatId, messageId);
                        try {
                            await sendMessageInChunks(chatId, "🟢 " + text);
                        } catch (error) {
                            console.error("Ошибка при отправке сообщения:", error);
                        } finally {
                            // Сбрасываем состояние пользователя после получения ответа
                            usersState.set(chatId, false);
                        }
                    } catch (error) {
                        logger.error("Произошла ошибка при обработке сообщения:", error.message);
                        await bot.sendMessage(chatId, 'Упс что то пошло не так. Нажми /start и отправь вопрос заново')
                        usersState.set(chatId, false);
                        await deleteGetText(chatId)

                    }
                }
            } catch (error) {
                logger.error("Произошла ошибка при проверке состояния:", error.message);
            }
        }
    }
}

//проверяет подписку и дает 5 бесплатных использований эту функцию использую там где нужно проверять
async function handleUserRequest(chatId) {

    const userDetails = await getUserDetailsFromDB(chatId);
    logger.info(`userDetails ${userDetails}`);

    if (!userDetails) {
        logger.error(`No user details found for chatId: ${chatId}`);
        // Возможно, вы хотите здесь добавить нового пользователя или вернуть ошибку
//        await addNewUser(chatId, userDetails.userName, userDetails.firstName);
        return false;
    }
    const dbDate = moment(userDetails.last_response_date).format('YYYY-MM-DD');
    const currentDate = moment().format('YYYY-MM-DD');

    if (dbDate !== currentDate) {
        logger.info("Текущая дата:", currentDate);
        logger.info("Дата в БД:", dbDate);
        logger.info("Последняя дата в БД:", userDetails.last_response_date);
        await resetResponseCount(chatId);
    }

    if (userDetails.subscription_status === 'active') {
        return true;
    } else if (userDetails.response_count < 5) {
        logger.info("Увеличиваем количество ответов для ChatId:", chatId);
        let count = await getResponseCount(chatId);
        let countPlus = count + 1;
        await setResponseCount(chatId, countPlus)
        return true;
    } else {
        const options = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Купить подписку', callback_data: 'buy_subscription'}]
                ]
            }
        };
        await bot.sendMessage(chatId, "🔥 <b>Привет " + userDetails.userName + "!</b> \n" +
            "\n" +
            "Кажется, вы исчерпали свои <b>5 бесплатных запросов</b> на сегодня! Не переживайте, у нас есть отличное предложение для вас.\n" +
            "\n" +
            "<b>Приобретите нашу премиум-подписку</b>, и вы получите неограниченный доступ к боту 24/7, быстрое обслуживание и множество дополнительных возможностей!\n" +
            "\n" +
            "💎 <b>Плюсы премиум-подписки</b>:\n" +
            "\n" +
            "1. <b>Неограниченное количество запросов.</b>\n" +
            "2. <b>Приоритетное обслуживание.</b>\n" +
            "3. <b>Эксклюзивные функции и обновления.</b>\n" +
            "\n" +
            "Не упустите свой шанс получить максимум от нашего сервиса!\n" +
            "\n" +
            "🌟 <b>Купить подписку</b> 🌟"
            , options);
        return false;
    }
}


async function getTranscription(msg, bot) {
    const {chat: {id: chatId}, voice: {file_id: fileId}} = msg;
    let tempFilePath, mp3FilePath;

    try {
        logger.info(`Получено голосовое сообщение от пользователя ${chatId}`);
        const file = await bot.getFile(fileId);
        const fileLink = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

        logger.info(`Загружаю голосовое сообщение по ссылке: ${fileLink}`);

        const response = await fetch(fileLink);
        tempFilePath = `temp_${Date.now()}.${file.file_path.split('.').pop()}`;

        await promisify(pipeline)(
            response.body,
            createWriteStream(tempFilePath)
        );

        mp3FilePath = await convertAudioToMP3(tempFilePath);
        const transcription = await transcribeAudio(mp3FilePath, chatId, bot);
        logger.info(`Текст голосового сообщения: ${transcription}`);

        return transcription;
    } catch (error) {
        logger.error('Ошибка при получении транскрипции голосового сообщения:', error);
        return null;
    } finally {
        if (tempFilePath && mp3FilePath) {
            await deleteTemporaryFiles(tempFilePath, mp3FilePath);
        }
    }
}

export async function handleVoice(msg, bot) {
    const {chat: {id: chatId}} = msg;

    try {
        const transcription = await getTranscription(msg, bot);

        if (transcription) {
            await processUserInput(transcription, bot, chatId);
        } else {
            await bot.sendMessage(chatId, '🚫 Извините, произошла ошибка при транскрибировании голосового сообщения.');
        }
    } catch (error) {
        logger.error('Ошибка при обработке голосового сообщения:', error);
        await bot.sendMessage(chatId, '🚫 Извините, произошла ошибка при обработке голосового сообщения.');
    }
}