import {chat} from "../chat-gpt/chat-gpt.js";
import TelegramBot from 'node-telegram-bot-api';
import {ANSWER_GREETING} from "./answer.js";
//const token = '6007077141:AAHKrrFa6xKW4nUd6Km_oDJ0pxJLiuL7DQE';// @Chat_GPT_RUSS_bot
const token = '6006265660:AAGqERvOuQtqteLH3NIMax3LEeRVZfqgpWs';// @ChatGPT_russ_bot
export const bot = new TelegramBot(token, {polling: true});

bot.on("message", (msg) =>{
    const message_id = msg.message_id;
    const chatId = msg.chat.id;
    const first_name = msg.chat.first_name;
    const username = msg.chat.username;
    const type = msg.chat.type;
    const messageText = msg.text;

    console.log('[Пользователь: ' + first_name +
    ' Отправил текст: ' + messageText +']')
})

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const messageText = ANSWER_GREETING;
    return await bot.sendMessage(chatId, messageText);
});

bot.on('string' && 'message' , async (msg) => {
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
