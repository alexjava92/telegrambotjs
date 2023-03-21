import TelegramBot from 'node-telegram-bot-api';
import {chat} from "../chat-gpt/chat-gpt.js";
const token = '6006265660:AAGqERvOuQtqteLH3NIMax3LEeRVZfqgpWs';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const messageText = 'Привет! Это бот написанный на JS';

    bot.sendMessage(chatId, messageText);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

bot.on('message', async (msg) => {
    console.log(msg)
    const chatId = msg.chat.id;

    let rrr = await chat(msg.text)
    bot.sendMessage(chatId, rrr);
});




