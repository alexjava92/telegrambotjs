import {Configuration, OpenAIApi} from "openai";
import fs from "fs";
import { config } from 'dotenv';

config()

let textAudio;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const resp = await openai.createTranscription(
    fs.createReadStream("file_5.oga"),
    "whisper-1"


);

console.log(resp.data.text)

textAudio = resp.data.text

