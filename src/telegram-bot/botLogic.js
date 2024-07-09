import {bot} from "./index.js";
import {
    addNewUser,
    addStatus,
    addStatusOne,
    getIdUser,
    getUserDetailsFromDB, resetResponseCount, savePaymentInfo, setSubscriptionActive, setSubscriptionEndDate,
    updateUserNameAndFirstName
} from "../database/database.js";
import {runUserExist} from "../database/database.js";
import {logger} from "../logger/logger.js";
import {config} from "dotenv";
import {updatePaidInvoice} from "../database/cryptoPayBD.js";
import {User} from "../Users/User.js";
import {getRates} from "../cryptoPay/cryptoPay.js";

config();

export const ADMIN = 194857311
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
//ресурс от куда пришли
let resourceFromCome = 'none';
let idUser;



//Проверка есть ли пользователь в БД если нет, добавить пользователя в БД
export const exist = async (chatId, userName, firstName, inputText) => {
    whereDidYouComeFrom(inputText);

    const userExists = await runUserExist(chatId);
    console.log(userExists);

    if (userExists === 'Пользователь существует') {
        logger.info('Пользователь уже существует в БД');

        // Получите текущие данные пользователя из базы данных
        const currentUserDetails = await getUserDetailsFromDB(chatId);
        if (currentUserDetails.userName !== userName || currentUserDetails.firstName !== firstName) {
            await updateUserNameAndFirstName(chatId, userName, firstName);
            logger.info(`Данные пользователя ${chatId} были обновлены.`);
        }
    }

    if (userExists === 'Пользователья не существует') {
        await addNewUser(chatId, userName, firstName);
        logger.info('Новый пользователь добавлен в БД');

        const id = await getIdUser(chatId);
        const idUser = id[0].id;

        if (userName === 'undefined') {
            userName = 'none';
        }

        let messageText = '👤Создан новый пользователь: \n'
            + firstName + ' | ' + '@' + userName + '\n'
            + 'ID: ' + idUser + ' | ChatID: ' + chatId + '\n'
            + 'Refer:\n'
            + 'Source: ' + resourceFromCome;

        await bot.sendMessage(ADMIN, messageText);
    }
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
            await addStatusOne(chatId, 'yes_subscription');
            await addStatus(chatId, "start_dialog");
            logger.info(`Пользователь подписан на канал!`)
        } else {
            // Пользователь не подписан на канал
            await bot.sendMessage(chatId, 'Пожалуйста, подпишитесь на канал @chat_gpt_neural_network, ' +
                'чтобы использовать этого бота.', keyboardText);
            await addStatusOne(chatId, 'no_subscription')

        }
    } catch (error) {
        logger.error(error.message);
        await bot.sendMessage(chatId, 'Произошла ошибка при проверке подписки на канал. Пожалуйста, ' +
            'попробуйте позже.');
    }
}

//Обрезает текст /start "ресурс" показывает с какого ресурса пришли в бота
export const whereDidYouComeFrom = (inputText) => {
// Разделить строку по пробелам
    const parts = inputText.split(" ");

// Получить второй элемент массива (индекс 1)
    const desiredPart = parts[1];

    resourceFromCome = desiredPart;
}




