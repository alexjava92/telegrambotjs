import {bot} from "./index.js";
import {
    addNewUser,
    addStatus,
    addStatusOne,
    getIdUser,
    getUserDetailsFromDB, resetResponseCount, setSubscriptionActive, setSubscriptionEndDate,
    updateUserNameAndFirstName
} from "../database/database.js";
import {runUserExist} from "../database/database.js";
import {logger} from "../logger/logger.js";


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
        // await bot.sendMessage(ADMIN2, messageText);
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

//Обрезает текст /start "ресурс" показывает с какого ресурса пришли в бота
export const whereDidYouComeFrom = (inputText) => {
// Разделить строку по пробелам
    const parts = inputText.split(" ");

// Получить второй элемент массива (индекс 1)
    const desiredPart = parts[1];

    resourceFromCome = desiredPart;
}

// Создает счет на оплату
export async function sendInvoice(chatId) {
    const title = "Премиум";
    const description = "Подписка на месяц с неограниченным доступом к функционалу бота.";
    const payload = "YourPayload";  // Полезная нагрузка для внутренних нужд
    const providerToken = "381764678:TEST:66777";  // Токен поставщика платежей
    //const startParameter = "test";
    const currency = "RUB";  // Валюта
    const prices = [
        {label: "Премиум подписка", amount: 15400}
    ];


    try {
        await bot.sendInvoice(chatId, title, description, payload, providerToken, currency, prices);
        logger.info("Invoice sent");
    } catch (error) {
        logger.error("Error sending invoice:", error);
    }
}

//Проверяем оплату и отправляем уведомления
export async function handlePreCheckoutQuery(bot, preCheckoutQuery) {

    try {
        // Подтверждение оплаты
        await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
        const chatId = preCheckoutQuery.from.id;
        logger.info(`Успешная оплата от ${preCheckoutQuery.from.first_name}`);
        await bot.sendMessage(ADMIN, `Оплата подписки от ${preCheckoutQuery.from.first_name}`);
        await bot.sendMessage(chatId, `👌 Спасибо за оплату ${preCheckoutQuery.from.first_name}, доступно неограниченное количество запросов!`);
        await setSubscriptionActive(chatId)
        await resetResponseCount(chatId)
        await setSubscriptionEndDate(chatId)

    } catch (error) {
        logger.error('Ошибка при обработке оплаты:', error);
        await bot.sendMessage(ADMIN, `Ошибка при обработке оплаты от ${preCheckoutQuery.from.first_name} ${error}`);
        // Отправить ошибку при оплате (если что-то пошло не так)
        await bot.answerPreCheckoutQuery(preCheckoutQuery.id, false, {
            error_message: "Что-то пошло не так, попробуйте снова позже."
        });
    }
}

//Принимает номер банковской карты убирает пробелы и отдает первые 6 цифр
export function processCardNumber(cardNumber) {
    try {
    const firstFourDigits = cardNumber.substring(0, 6);  // берем первые четыре цифры
    return { firstFourDigits };
    }catch (error){

    }
}
