// Создает счет на оплату
import {bot} from "../index.js";
import {logger} from "../../logger/logger.js";
import {ADMIN} from "../botLogic.js";
import {User} from "../../Users/User.js";
import {savePaymentInfo} from "../../database/database.js";


//Выставление счетов
export async function sendInvoice(chatId, amount, prevMessageId) {
    const title = "Оплата ChatGPT | bot";
    const description = "Пополнение баланса, бота.";
    const payload = "YourPayload";  // Полезная нагрузка для внутренних нужд
    const providerToken = process.env.PROVIDER_TOKEN;  // Токен поставщика платежей
    //const startParameter = "test";
    const currency = "RUB";  // Валюта
    const prices = [
        {label: "Пополнение баланса", amount: amount * 100},
    ];

    console.log('prevMessageId', prevMessageId.message_id)

    try {
        await bot.sendInvoice(chatId, title, description, payload, providerToken, currency, prices);
        logger.info("Invoice sent");
        // Заменяем предыдущее сообщение
        if (prevMessageId) {
            await bot.deleteMessage(chatId, prevMessageId.message_id);

        }
    } catch (error) {
        logger.error("Error sending invoice:", error);
    }
}

//Проверяем оплату и отправляем уведомления
export async function handlePreCheckoutQuery(bot, preCheckoutQuery) {

    try {
        // разрешение оплаты
        await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
        logger.info("Оплата разрешена, ожидаем оплаты")


    } catch (error) {
        logger.error('Ошибка при обработке оплаты:', error);
        await bot.sendMessage(ADMIN, `Ошибка при разрешении оплаты от ${preCheckoutQuery.from.first_name} ${error}`);
        // Отправить ошибку при оплате (если что-то пошло не так)
        await bot.answerPreCheckoutQuery(preCheckoutQuery.id, false, {
            error_message: "Что-то пошло не так, попробуйте снова позже."
        });
    }
}

//Успешная оплата
export async function handleSuccessfulPayment(bot, message) {

    try {
        // Запись информации о платеже в базу данных (пример)
        const payment = message.successful_payment.telegram_payment_charge_id;
        const balance = message.successful_payment.total_amount / 100;
        await savePaymentInfo(message.chat.id, payment);
        console.log(message)

        // Подтверждение оплаты

        const chatId = message.chat.id;
        logger.info(`Успешная оплата от ${message.from.first_name}`);
        await bot.sendMessage(ADMIN, `Оплата подписки от ${message.from.first_name} сумма: ${balance} руб.`);
        await bot.sendMessage(chatId, `👌 Спасибо за оплату ${message.from.first_name}, доступно неограниченное количество запросов!`);
        const user = await User.getUser(chatId);

        if (user) {
            await user.setSubscriptionActive();
            await user.resetResponseCount();
           // await user.setSubscriptionEndDate();
            const totalBalance = await user.getBalance() + balance
            await user.setBalance(totalBalance);
        } else {
            logger.warn('Пользователь не найден.')
        }


    } catch (error) {
        logger.error("Ошибка при обработке успешного платежа:", error);
        await bot.sendMessage(ADMIN, `Ошибка при обработке оплаты от ${message.from.first_name} ${error}`);
        // Отправить ошибку при оплате (если что-то пошло не так)
        await bot.sendMessage(message.chat.id, "Произошла ошибка при обработке вашего платежа. Пожалуйста, свяжитесь с поддержкой.");
    }
}



