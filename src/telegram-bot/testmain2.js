import { config } from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import sharp from 'sharp';

config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function convertToRGBA(inputPath, outputPath) {
    await sharp(inputPath)
        .toFile(outputPath)
        .then((info) => {
            console.log('Image converted:', info);
        })
        .catch((err) => {
            console.error('Error converting image:', err);
        });
}

const inputPath = 'img-RPYbWMtuhm6skyrgLwvXuseZ.png';
const outputPath = 'converted-RPYbWMtuhm6skyrgLwvXuseZ.png';

await convertToRGBA(inputPath, outputPath);

const createImageCompletionParams = {
    model: 'image-alpha-001',
    prompt: 'зубы более белые должны быть',
    n: 1,
    max_tokens: 1024,
    stop: null,
    temperature: 0.8,
    top_p: 1,
    log_level: 'info',
    echo: false,
    presence_penalty: 0,
    frequency_penalty: 0,
    user: 'user-vBfEoXKyP4OmwFXg5phl29wO',
    image_input: fs.createReadStream(outputPath),
    size: '1024x1024',
};

const response1 = await openai.createCompletion(createImageCompletionParams);

let images2 = response1.data;
console.log(images2);
