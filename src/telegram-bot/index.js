import {askQuestion} from "../chat-gpt/chat-gpt.js";
import TelegramBot from 'node-telegram-bot-api';
import {checkingYourSubscription, exist, sendMessageInChunks} from "./botLogic.js";
import {addStatus, deleteGetText, getStatus, getStatusOne} from "../database/database.js";
import {logger} from "../logger/logger.js";


const token = '6007077141:AAHKrrFa6xKW4nUd6Km_oDJ0pxJLiuL7DQE';// @Chat_GPT_RUSS_bot
//const token = '6006265660:AAGqERvOuQtqteLH3NIMax3LEeRVZfqgpWs';// @ChatGPT_russ_bot

//https://t.me/Btcbank24com_v2_bot?start=btcbank24
//https://t.me/Chat_GPT_RUSS_bot?start=btcbank24







export const bot = new TelegramBot(token, {polling: true});

logger.info('Приложение запущено');

const keyboardText = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Завершить диалог',
                    callback_data: 'button_pressed',
                },
                {
                    text: 'Завершить диалог',
                    callback_data: 'button_pressed',
                },
            ],
        ],
    },
}

const keyboardMenu = {
    reply_markup: {
        keyboard: [
            [
                {
                    text: 'Завершить диалог',

                },
            ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
}

let statusUserFinal;

let status_1;

try {
    async function handleUserMessage(msg) {
        const {
            message_id,
            chat: {id: chatId, first_name, username, type},
            text: messageText,
            photo, sticker, document,
        } = msg;

        if (photo) {
            console.log("получено фото");
        }

        const st = await getStatusOne(chatId);
        status_1 = st[0].column_status_1;

        return status_1 === "yes_subscription";
    }

    /*bot.onText(/\/start/, async (msg) => {
        await exist(msg.chat.id, msg.chat.username, msg.chat.first_name);
        await checkingYourSubscription(msg.chat.id);

        if (await handleUserMessage(msg)) {
            const chatId = msg.chat.id;
            await addStatus(chatId, "start_dialog");
            await deleteGetText(chatId);

            const messageText =
                "👋 Добро пожаловать " +
                msg.chat.first_name +
                ", я немного расскажу как пользоваться ботом. \n" +
                "\nДля начала общение с нейронной сетью напишите свой вопрос.\n" +
                "\nЧто бы сбросить историю диалога нажмите \"Завершить диалог\" " +
                "это отчистит историю диалогов.";

            await bot.sendMessage(chatId, messageText, keyboardMenu);

            return;
        }
    });

    bot.onText(/Завершить диалог/i, async (msg) => {
        if (await handleUserMessage(msg)) {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId, "История диалога успешно сброшена!");
            await deleteGetText(chatId);
        }
    });

    bot.onText(/Начать диалог/i, async (msg) => {
        if (await handleUserMessage(msg)) {
            const chatId = msg.chat.id;
            await bot.sendMessage(
                chatId,
                "Диалог успешно начат!" + "\nТеперь можете спросить меня о чем угодно..."
            );
            await addStatus(chatId, "start_dialog");
        }
    });

    bot.on("message", async (msg) => {
        const {
            message_id,
            chat: {id: chatId, first_name, username, type},
            text: messageText,
            photo, sticker, document,
        } = msg;

        console.log(
            `[Пользователь: ${first_name} Отправил текст: ${messageText} message_id: ${message_id}]`
        );
        await exist(chatId, username, first_name);
        await checkingYourSubscription(chatId);
        await addStatus(chatId, 'start_dialog');

        if (photo) {
            console.log("получено фото");
            await bot.sendMessage(chatId, "🟢 Я еще не умею обрабатывать фото, в скором времени меня этому обучат. 🤭");
            // Здесь вы можете обрабатывать полученные фотографии
            return;
        }
        if (sticker) {
            console.log("получен стикер");
            await bot.sendMessage(chatId, "🟢 Я еще не умею обрабатывать стикеры, в скором времени меня этому обучат. 🤭");
            // Здесь вы можете обрабатывать полученные фотографии
            return;
        }
        if (document) {
            console.log("получен файл");
            await bot.sendMessage(chatId, "🟢 Я еще не умею обрабатывать файлы, в скором времени меня этому обучат. 🤭");
            // Здесь вы можете обрабатывать полученные фотографии
            return;
        }
        const st = await getStatusOne(chatId);
        status_1 = st[0].column_status_1;
        if (status_1 === "yes_subscription") {
            try {
                let statusUser;
                const result = await getStatus(chatId);
                console.log(result);
                statusUser = result[0].column_status;
                console.log("Проверяю статус: " + statusUser);
                statusUserFinal = statusUser;

            } catch (error) {
                console.error("Error:", error);
            }

            if (statusUserFinal === "start_dialog") {
                const chatId = msg.chat.id;
                const sentMessage = await bot.sendMessage(
                    chatId,
                    "📝 Нейронка печатает... от 5 сек до 1 минуты могут формироваться ответы"
                );
                const messageId = sentMessage.message_id;
                let text = await askQuestion(msg.text, chatId);
                console.log(message_id);
                await bot.deleteMessage(chatId, messageId);
                await bot.sendMessage(chatId, "🟢 " + text);
                return;
            }
        }
    });

    bot.on('callback_query', async (callbackQuery) => {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const photo = msg.text.photo;

        if (photo) {
            console.log('получено фото')
        }

        if (action === 'checking_your_subscription') {
            await checkingYourSubscription(chatId)
            const st = await getStatusOne(chatId);
            status_1 = st[0].column_status_1;
            if (status_1 === 'yes_subscription') {
                await bot.sendMessage(chatId, '😊 Спасибо, за подписку! Вы можете использовать функционал бота.');
            } else
                await bot.sendMessage(chatId, 'Вы не подписались 😔');
            /!*await bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Вы нажали на кнопку!'
            });*!/
            return;
        }
    });*/

    bot.on("text", async (msg) => {
        const {
            message_id,
            chat: { id: chatId, first_name, username, type },
            text: messageText,
        } = msg;

        console.log(`[Пользователь: ${first_name} Отправил текст: ${messageText} message_id: ${message_id}]`);
        await exist(chatId, username, first_name);
        await checkingYourSubscription(chatId);

        if (messageText === "/start") {
            if (await handleUserMessage(msg)) {
                await addStatus(chatId, "start_dialog");
                await deleteGetText(chatId);

                const welcomeMessage =
                    "👋 Добро пожаловать " +
                    first_name +
                    ", я немного расскажу как пользоваться ботом. \n" +
                    "\nДля начала общение с нейронной сетью напишите свой вопрос.\n" +
                    "\nЧто бы сбросить историю диалога нажмите \"Завершить диалог\" " +
                    "это отчистит историю диалогов.";

                await bot.sendMessage(chatId, welcomeMessage, keyboardMenu);
                return;
            }
        } else if (messageText === "Завершить диалог") {
            if (await handleUserMessage(msg)) {
                await bot.sendMessage(chatId, "История диалога успешно сброшена!");
                await deleteGetText(chatId);
            }
        } else if (messageText === "Начать диалог") {
            if (await handleUserMessage(msg)) {
                await bot.sendMessage(chatId, "Диалог успешно начат!\nТеперь можете спросить меня о чем угодно...");
                await addStatus(chatId, "start_dialog");
            }
        } else {
            // Обработка обычных текстовых сообщений
            const st = await getStatusOne(chatId);
            status_1 = st[0].column_status_1;

            if (status_1 === "yes_subscription") {
                try {
                    let statusUser;
                    const result = await getStatus(chatId);
                    console.log(result);
                    statusUser = result[0].column_status;
                    console.log("Проверяю статус: " + statusUser);
                    statusUserFinal = statusUser;
                } catch (error) {
                    console.error("Error:", error);
                }

                if (statusUserFinal === "start_dialog") {
                    const sentMessage = await bot.sendMessage(chatId, "📝 Нейронка печатает... от 5 сек до 1 минуты могут формироваться ответы");
                    const messageId = sentMessage.message_id;
                    let text = await askQuestion(msg.text, chatId);


                    console.log(message_id);
                    await bot.deleteMessage(chatId, messageId);
                    await sendMessageInChunks(chatId, "🟢 " + text);
                    return;
                }
            }
        }
    });

    bot.on('callback_query', async (callbackQuery) => {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const photo = msg.text.photo;

        if (photo) {
            console.log('получено фото')
        }

        if (action === 'checking_your_subscription') {
            await checkingYourSubscription(chatId)
            const st = await getStatusOne(chatId);
            status_1 = st[0].column_status_1;
            if (status_1 === 'yes_subscription') {
                await bot.sendMessage(chatId, '😊 Спасибо, за подписку! Вы можете использовать функционал бота. Напишите что-нибудь, например: Первый человек на луне?');
            } else
                await bot.sendMessage(chatId, 'Вы не подписались 😔');
            await bot.answerCallbackQuery(callbackQuery.id, {
            text: ''
        });
        return;
    }
});





} catch (err) {
    console.log(err)
}

