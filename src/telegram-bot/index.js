import {chat} from "../chat-gpt/chat-gpt.js";
import TelegramBot from 'node-telegram-bot-api';
import {ANSWER_GREETING} from "./answer.js";

const token = '6007077141:AAHKrrFa6xKW4nUd6Km_oDJ0pxJLiuL7DQE';
export const bot = new TelegramBot(token, {polling: true});


bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const messageText = ANSWER_GREETING;

    await bot.sendMessage(chatId, messageText);
});

bot.on('message', async (msg) => {
    console.log(msg)
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, "Нейронка печатает....");
    let text = await chat(msg.text)

    console.log(text);
    await bot.sendMessage(chatId, "🟢 " + text);
});

if(""){

}else if(""){

}
