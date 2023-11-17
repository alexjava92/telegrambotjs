// Импорт с использованием ESM синтаксиса
import { Configuration, OpenAIApi } from "openai";
import { HttpsProxyAgent } from 'https-proxy-agent';
import {proxy} from "../chat-gpt/configGpt.js";
import { config } from "dotenv";


config();

const proxyUrl = `http://${proxy.auth}@${proxy.host}:${proxy.port}`;
const agent = new HttpsProxyAgent(proxyUrl);


// Конфигурация OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    axios: { agent },
});

const openai = new OpenAIApi(configuration);

async function getChatGptResponse(question) {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: question }
            ]
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Использование
const question = "привет как дела?";
getChatGptResponse(question).then(response => console.log(response));
