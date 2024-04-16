// Импорт с использованием ESM синтаксиса
import { Configuration, OpenAIApi } from "openai";
import { HttpsProxyAgent } from 'https-proxy-agent';
import { proxy } from "../chat-gpt/configGpt.js";
import { config } from "dotenv";
import axios from 'axios'; // Убедитесь, что axios установлен

config(); // Загружаем переменные среды

// Создаём агент прокси
const proxyUrl = `http://${proxy.auth}@${proxy.host}:${proxy.port}`;
const httpsAgent = new HttpsProxyAgent(proxyUrl);

// Создаём экземпляр axios с агентом прокси


// Конфигурация OpenAI с использованием инстанса axios
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    // Обратите внимание: никаких других изменений в конфигурации не требуется
});

const openai = new OpenAIApi(configuration); // Передаём инстанс axios при создании объекта OpenAIApi

async function getChatGptResponse(question) {
    try {
        // Передаём конфигурацию axios как второй параметр в метод createChatCompletion
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: question }
            ]
        }, ); // Здесь мы передаём httpsAgent напрямую
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Использование
const question = "привет как дела?";
getChatGptResponse(question).then(response => console.log(response));
