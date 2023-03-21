import { config } from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import TelegramBot from 'node-telegram-bot-api';
const token = '6006265660:AAGqERvOuQtqteLH3NIMax3LEeRVZfqgpWs';

const bot = new TelegramBot(token, { polling: true });

config();

let configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // don't forget to create ".env" file with the line "OPENAI_API_KEY=your_secret_key here"
});
let openai = new OpenAIApi(configuration);

 export async function chat(prompt) {
  let response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system",
          content: setup || "Artificial intelligence"
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // extract the answer from response
   let answer = response.data.choices[0].message.content;

  return answer;
}

let setup = ``;
let prompt = "привет";

console.log(await chat(prompt));


bot.on('message', async (msg) => {
    console.log(msg)
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Нейронка печатает....");
    let rrr = await chat(msg.text)

    console.log("🟢 "+rrr);
    bot.sendMessage(chatId, "🟢 "+rrr);
});