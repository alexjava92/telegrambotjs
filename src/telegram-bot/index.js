import TelegramBot from 'node-telegram-bot-api';
import {logger} from "../logger/logger.js";
import { HttpsProxyAgent } from 'https-proxy-agent';
import {handleText, handleVoice} from "./handlers/TextHandler.js";
import {handleCallbackQuery} from "./handlers/TextHandler.js";
import {proxy, token} from "./config/Config.js";
import {ADMIN, handlePreCheckoutQuery} from "./botLogic.js";
import {checkAndSetSubscriptionStatus} from "../database/database.js";




//const token = '6007077141:AAHKrrFa6xKW4nUd6Km_oDJ0pxJLiuL7DQE';// @Chat_GPT_RUSS_bot основной
//const token = '6006265660:AAGqERvOuQtqteLH3NIMax3LEeRVZfqgpWs';// @ChatGPT_russ_bot
//const token = '495082999:AAFG-JchEP7Kmr7iJAlwmxyTqy2qdeUVBmk';//  @javatest92_bot

//https://t.me/Btcbank24com_v2_bot?start=btcbank24
//https://t.me/Chat_GPT_RUSS_bot?start=btcbank24

let bot;

try {
    const proxyUrl = `http://${proxy.auth}@${proxy.host}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);
    bot = new TelegramBot(token, {polling: true, request: {agent}});
} catch (err) {
    logger.error("Глобальная ошибка ёбаный рот! пытаюсь обработать ошибку! " + err);
}

export { bot };

logger.info('Приложение запущено');
logger.info('Запущена проверка подписок раз в 24 часа', setInterval(checkAndSetSubscriptionStatus, 24 * 60 * 60 * 1000));



try {

    bot.on('text', (msg) => handleText(msg, bot));
    bot.on('callback_query', (callbackQuery) => handleCallbackQuery(callbackQuery, bot));
    bot.on('voice', (msg) => handleVoice(msg, bot));
    bot.on('pre_checkout_query', async (preCheckoutQuery,) => {
        await handlePreCheckoutQuery(bot, preCheckoutQuery);
    });

} catch (err) {
    console.log(err)
}

