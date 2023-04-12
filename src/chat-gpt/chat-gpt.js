import {config} from "dotenv";
import {Configuration, OpenAIApi} from "openai";
import {addNewText, getText} from "../database/database.js";

config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // don't forget to create ".env" file with the line "OPENAI_API_KEY=your_secret_key here"
});
const openai = new OpenAIApi(configuration);

const conversationHistory = [];
//Добавляется история сообщений в массив
const addToHistory = (question, answer) => {
    const newEntry = {
        question,
        answer,
    };
    conversationHistory.unshift(newEntry);
};

//Ответ от ИИ
export async function chat(prompt, chatId) {
    let massText = await getText(chatId);
    let conversationHistory = [];

    try {
        // Проверяем, что massText и massText[0].messaget_text не равны null
        if (massText !== null && massText[0] !== null && massText[0].messaget_text !== null) {
            // Получаем историю разговора в виде строки JSON
            const conversationHistoryJSON = massText[0].messaget_text;

            // Преобразуем строку JSON в массив объектов
            conversationHistory = JSON.parse(conversationHistoryJSON);
        }
    } catch (error) {
        // Если возникает ошибка, выводим сообщение об ошибке и присваиваем пустой массив
        console.error("Ошибка при получении истории разговора:", error);
        conversationHistory = [];
    }

    // Преобразовываем историю разговора в нужный формат для OpenAI API
    const messageHistory = conversationHistory.map((entry) => [
        { role: "user", content: entry.question },
        { role: "assistant", content: entry.answer },
    ]).flat();

    // Добавляем текущий вопрос пользователя в историю
    messageHistory.push({ role: "user", content: prompt });

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messageHistory,
    });

    // Извлекаем ответ из ответа API
    const answer = response.data.choices[0].message.content;

    console.log('Длина текста: ' + answer.length)

    return answer;
}

export const askQuestion = async (question, chatId) => {
    const answer = await chat(question, chatId)
    addToHistory(question, answer)
    console.log('Ответ нейронки: ' + answer)

    addNewText(chatId, conversationHistory).then(r => console.log(r))

    return answer
};




//await askQuestion("привет")
