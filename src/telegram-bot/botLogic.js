import {bot} from "./index.js";
import {addNewUser, addStatusOne} from "../database/database.js";
import {runUserExist} from "../database/database.js";


const ADMIN = 194857311
//const ADMIN2 = 921469238
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

//Проверка есть ли пользователь в БД если нету, добавить пользователя в БД
export const exist = async (chatId, userName, firstName) => {
    const messageText = '👤Создан новый пользователь '+ firstName + '\n' +
        firstName +' '+ chatId + '\n' +
        'Refer:\n' +
        'Source: '
    runUserExist(chatId)
        .then(async result => {
                console.log(result)
                if (result === 'Пользователь существует') {
                    console.log('Пользователь уже существует в БД')
                }
                if(result === 'Пользователья не существует'){
                    addNewUser(chatId, userName, firstName)
                        .then(async result => {
                            console.log(result)
                            await bot.sendMessage(ADMIN, messageText)
                           // await bot.sendMessage(ADMIN2, messageText)
                        })
                }
            }
        )
}

//Проверка подписан ли пользователь на канал
export const checkingYourSubscription = async  (chatId) => {
    // Проверяем подписку на канал
    try {
        const chatMember = await bot.getChatMember(channelUsername, chatId);

        if (chatMember && (chatMember.status === 'member' || chatMember.status === 'administrator'
            || chatMember.status === 'creator')) {
            // Пользователь подписан на канал, разрешаем использовать бота
            //  bot.sendMessage(chatId, 'Вы подписаны на канал. Можете пользоваться ботом.');
            await addStatusOne(chatId, 'yes_subscription')
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