import TelegramBot from 'node-telegram-bot-api';
import {logger} from "../logger/logger.js";
import {HttpsProxyAgent} from 'https-proxy-agent';
import {handleText, handleVoice} from "./handlers/TextHandler.js";
import {proxy, token} from "./config/Config.js";
import {checkAndSetSubscriptionStatus, savePaymentInfo} from "../database/database.js";
import {handlePhoto} from "./photo/handlePhoto.js";
import {handlePreCheckoutQuery, handleSuccessfulPayment} from "./payment/paymentYandex.js";
import {handleVideo} from "./video/handleVideo.js";
import {handlePDF} from "./document/handlePDF.js";
import {updateRubRates} from "../cryptoPay/cryptoPay.js";
import {handleCallbackQuery} from "./handlers/handleCallbackQuery.js";


import {server} from "../cryptoPay/cryptoPayServer.js";


let bot;

try {
    const proxyUrl = `http://${proxy.auth}@${proxy.host}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    bot = new TelegramBot(token, {polling: true, /*request: {agent}*/});
} catch (err) {
    logger.error("Глобальная ошибка рваный рот) пытаюсь обработать ошибку! " + err);
}

export {bot};

logger.info('Приложение запущено');
logger.info('Запущена проверка подписок раз в 24 часа', setInterval(checkAndSetSubscriptionStatus, 24 * 60 * 60 * 1000));
logger.info('Получение курса RUB один раз в час', setInterval(updateRubRates, 60 * 60 * 1000));



try {

    bot.on('message', async (msg) => {
        console.log('msg', msg);
        // Проанализировать входящее сообщение и распределить обработку
        if (msg.text) {
            // Обработка текстовых сообщений
            await handleText(msg, bot);
        } else if (msg.voice) {
            // Обработка голосовых сообщений
            await handleVoice(msg, bot);
        } else if (msg.photo) {
            // Обработка фотографий
            await handlePhoto(msg, bot);
        }else if (msg.video_note) {
            // Обработка видео
            await handleVideo(msg, bot);
        }else if (msg.document && msg.document.mime_type === 'application/pdf') {
            // Обработка PDF-файлов
            await handlePDF(msg, bot);
        }
        // .. и так далее для других типов сообщений
    });

    bot.on('callback_query', (callbackQuery) => handleCallbackQuery(callbackQuery, bot));
    /*bot.on('text', (msg) => handleText(msg, bot));*/

   /* bot.on('voice', (msg) => handleVoice(msg, bot));*/
   /* bot.on('photo', async (msg) => {
        await handlePhoto(msg, bot);
    });*/
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

// Запускаем сервер
server.listen(3001, () => {
    logger.info('Вебхук для Crypto Pay API запущен на порту 3001');
});

