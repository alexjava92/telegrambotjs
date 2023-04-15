import { SpeechClient } from '@google-cloud/speech';
import axios from 'axios';


const speechClient = new SpeechClient(); // Не забудьте настроить аутентификацию

export const transcribeAudio = async (fileLink) => {
    const response1 = await axios.get(fileLink, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(response1.data);

    const request = {
        audio: {
            content: audioBuffer.toString('base64'),
        },
        config: {
            encoding: 'OGG_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US', // Используйте нужный языковой код
        },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n');

    return transcription;
};
