import {bot} from "./index.js";

let responseUser = (request, chatId) =>{

}
bot.on("message", async (msg) =>{
    const chatId = msg.chat.id;
    const messageText = 'тест'
    await bot.sendMessage(chatId, messageText)
})