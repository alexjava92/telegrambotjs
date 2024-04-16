import TelegramBot from 'node-telegram-bot-api';
import {logger} from "../logger/logger.js";
import { HttpsProxyAgent } from 'https-proxy-agent';
import {handleText, handleVoice} from "./handlers/TextHandler.js";
import {handleCallbackQuery} from "./handlers/TextHandler.js";
import {proxy, token} from "./config/Config.js";
import {ADMIN, handlePreCheckoutQuery, handleSuccessfulPayment} from "./botLogic.js";
import {checkAndSetSubscriptionStatus, savePaymentInfo} from "../database/database.js";
import openai from "openai";
import {generateImage} from "../chat-gpt/chat-gpt.js";

let bot;

try {
    const proxyUrl = `http://${proxy.auth}@${proxy.host}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    bot = new TelegramBot(token, {polling: true, /*request: {agent}*/});
} catch (err) {
    logger.error("Глобальная ошибка рваный рот) пытаюсь обработать ошибку! " + err);
}

export { bot };

logger.info('Приложение запущено');
logger.info('Запущена проверка подписок раз в 24 часа', setInterval(checkAndSetSubscriptionStatus, 24 * 60 * 60 * 1000));


try {
    bot.onText(/\/image (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const prompt = match[1]; // Получаем описание изображения из сообщения


        try {
            await bot.sendMessage(chatId, "рисую...")
            const imageUrl = await generateImage(prompt); // Генерируем изображение
            await bot.sendPhoto(chatId, imageUrl); // Отправляем сгенерированное изображение
        } catch (error) {
            await bot.sendMessage(chatId, "Ошибка при генерации изображения.");
            console.error("Error generating image:", error);
        }
    });
    bot.on('text', (msg) => handleText(msg, bot));
    bot.on('callback_query', (callbackQuery) => handleCallbackQuery(callbackQuery, bot));
    bot.on('voice', (msg) => handleVoice(msg, bot));
    bot.on('pre_checkout_query', async (preCheckoutQuery,) => {
        //разрешения для оплаты с карты
        await handlePreCheckoutQuery(bot, preCheckoutQuery);
    });
    bot.on('successful_payment', async (message) => {
        // Проверка платежа
        await handleSuccessfulPayment(bot, message)
    });



} catch (err) {
    console.log(err)
}

