import {bot} from "./index.js";
import {addNewUser, addStatus, addStatusOne, getIdUser} from "../database/database.js";
import {runUserExist} from "../database/database.js";
import {logger} from "../logger/logger.js";


const ADMIN = 194857311
const ADMIN2 = 921469238
const channelUsername = '@chat_gpt_neural_network';

const keyboardText = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Проверить подписку',
                    callback_data: 'checking_your_subscription',
                },

            ],
        ],
    },
}
//рессурс от куда пришли
let resourceFromCome = 'none';
let idUser;

//Проверка есть ли пользователь в БД если нету, добавить пользователя в БД
export const exist = async (chatId, userName, firstName, inputText) => {

    whereDidYouComeFrom(inputText)

    runUserExist(chatId)
        .then(async result => {
                console.log(result)
                if (result === 'Пользователь существует') {
                    logger.info('Пользователь уже существует в БД')
                }
                if (result === 'Пользователья не существует') {
                    addNewUser(chatId, userName, firstName)
                        .then(async result => {
                            logger.info(result)
                            const id = await getIdUser(chatId)
                            idUser = id[0].id


                            let messageText = '👤Создан новый пользователь: \n'
                                + firstName + '|' + userName + '\n' +
                                'ID: ' + idUser + ' | ChatID: ' + chatId + '\n'
                                + 'Refer:\n' +
                                'Source: ' + resourceFromCome

                            await bot.sendMessage(ADMIN, messageText)
                           // await bot.sendMessage(ADMIN2, messageText)
                        })


                }
            }
        )
}

//Проверка подписан ли пользователь на канал
export const checkingYourSubscription = async (chatId) => {
    // Проверяем подписку на канал
    try {
        const chatMember = await bot.getChatMember(channelUsername, chatId);

        if (chatMember && (chatMember.status === 'member' || chatMember.status === 'administrator'
            || chatMember.status === 'creator')) {
            // Пользователь подписан на канал, разрешаем использовать бота
            //  bot.sendMessage(chatId, 'Вы подписаны на канал. Можете пользоваться ботом.');
            await addStatusOne(chatId, 'yes_subscription')
            await addStatus(chatId, "start_dialog");
        } else {
            // Пользователь не подписан на канал
            await bot.sendMessage(chatId, 'Пожалуйста, подпишитесь на канал @chat_gpt_neural_network, ' +
                'чтобы использовать этого бота.', keyboardText);
            await addStatusOne(chatId, 'no_subscription')

        }
    } catch (error) {
        console.error('Ошибка при проверке подписки на канал:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при проверке подписки на канал. Пожалуйста, ' +
            'попробуйте позже.');
    }
}

//Разделяет текст на 4к символов
export async function sendMessageInChunks(chatId, text) {

    const maxMessageLength = 4000;
    const textLength = text.length;

    if (textLength <= maxMessageLength) {
        await bot.sendMessage(chatId, text);
    } else {
        let startIndex = 0;
        let endIndex = maxMessageLength;

        while (startIndex < textLength) {
            const messageChunk = text.slice(startIndex, endIndex);
            await bot.sendMessage(chatId, messageChunk);

            startIndex += maxMessageLength;
            endIndex += maxMessageLength;
        }
    }
}

//Обрезает текст /start blablabla показывает с какого рессурса пришли в бота
export const whereDidYouComeFrom = (inputText ) => {
// Разделить строку по пробелам
    const parts = inputText.split(" ");

// Получить второй элемент массива (индекс 1)
    const desiredPart = parts[1];

    resourceFromCome = desiredPart;
}