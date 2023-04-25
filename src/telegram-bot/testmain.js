import {config} from "dotenv";
import {Configuration, OpenAIApi} from "openai";
import fs from "fs";
import sharp from "sharp";
config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
/*const response = await openai.createImage({
    prompt: "красивая улыбка",
    n: 1,
    size: "1024x1024",

});
const obj = response.data
console.log(typeof obj)
let url;

if (obj && obj.data && obj.data.length > 0 && obj.data[0].url) {
    url = obj.data[0].url;
    console.log(url);
} else {
    console.log('URL не найден');
}*/


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

const createImageEditParams = {
    input_image: fs.createReadStream(outputPath),
    prompt: 'зубы более белые должны быть',
    num_images: 1,
    size: '1024x1024',
};

const response1 = await openai.createImageEdit(createImageEditParams);

let images2 = response1.data;
console.log(images2);


