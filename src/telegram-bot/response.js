import {bot} from "./index.js";


let responseUser = async (msg, chatId) => {

    if (bot.on.target.message) {
        chatId = msg.chat.id;
        const messageText = 'тест'
        await bot.sendMessage(chatId, messageText)
    }

}
