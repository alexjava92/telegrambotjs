import {generateImage} from "../chat-gpt/chat-gpt.js";

const imagePrompt = "Красивый закат над горами";
const imageUrl = await generateImage(imagePrompt);

