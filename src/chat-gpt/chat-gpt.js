import {config} from "dotenv";
import {Configuration, OpenAIApi} from "openai";

config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // don't forget to create ".env" file with the line "OPENAI_API_KEY=your_secret_key here"
});
const openai = new OpenAIApi(configuration);





export async function chat(prompt) {
    while (true){
    let messages = [{role: "system", content : prompt}]
    console.log(messages)
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301",
        messages: messages,
    });

    // extract the answer.js from response
    const answer = response.data.choices[0].message.content;
    messages.push({
        role: "assistant", content: answer
    })
    console.log(messages)
        
    return answer;
}
}
const setup = ``;


//console.log(await chat(prompt));
