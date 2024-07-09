// Создаем экземпляр CryptoPay с токеном
import {CryptoPay} from "@foile/crypto-pay-api";
import * as http from "http";
import crypto from 'crypto';

import {updatePaidInvoice} from "../database/cryptoPayBD.js";
import {User} from "../Users/User.js";
import {getRates} from "./cryptoPay.js";

import {logger} from "../logger/logger.js";
import {ADMIN} from "../telegram-bot/botLogic.js";
import {bot} from "../telegram-bot/index.js";




const appToken = '175443:AAf3emNkIvlWTgKIzjG7WR42g32biNJOSgZ';
const secretKey = crypto.createHash('sha256').update(appToken).digest();

// Настраиваем конфигурацию вебхука
const cryptoPay = new CryptoPay(appToken, {
    webhook: {
        serverHostname: 'localhost',
        serverPort: 3001,
        path: '/'
    },
});

cryptoPay.on('invoice_paid', update => handleInvoicePaid(update.payload));


// Создаем HTTP-сервер для обработки вебхука
export const server = http.createServer((req, res) => {
    console.log('Получен запрос:', req.method, req.url);
    if (req.method === 'POST' && req.url === '/') {
        let body = '';

        // Собираем полученные данные из тела запроса
        req.on('data', (chunk) => {
            body += chunk.toString();
            console.log('Получены данные:', chunk.toString());
        });

        // После получения всех данных
        req.on('end', () => {
            console.log('Получено уведомление от Crypto Pay API:', body);

            // Верифицируем запрос
            const hmac = crypto.createHmac('sha256', secretKey).update(body).digest('hex');
            const signature = req.headers['x-cryptobot-signature'];
            console.log('Вычисленный hmac:', hmac);
            console.log('Полученная подпись:', signature);

            if (signature === hmac) {
                // Запрос прошел верификацию
                const update = JSON.parse(body);
                console.log('Тип события:', update.event);


            } else {
                console.error('Ошибка верификации запроса Crypto Pay API');
            }

            // Отправляем ответ
            res.statusCode = 200;
            res.end();
        });
    } else {
        // Обработка других маршрутов
        res.statusCode = 404;
        res.end();
    }
});

// Функции для обработки событий
export async function handleInvoicePaid(invoice) {
    console.log(invoice);
    console.log(`Инвойс ${invoice.invoice_id} оплачен на сумму ${invoice.amount} ${invoice.asset}`);
    await updatePaidInvoice(invoice);

    const chatId = invoice.description;
    const user = await User.getUser(chatId);
    console.log(user)

    const rates = await getRates();
    const rateForAsset = rates[invoice.asset];

    if (user) {
        await user.setSubscriptionActive();
        await user.resetResponseCount();
       // await user.setSubscriptionEndDate();

        const balanceInRub = Math.round(parseFloat(invoice.paid_amount) * rateForAsset);
        const totalBalance = await user.getBalance() + balanceInRub;
        await user.setBalance(totalBalance);
        await bot.sendMessage(ADMIN, `Оплата подписки от ${user.firstName} сумма: ${balanceInRub} руб.`);
        await bot.sendMessage(chatId, `👌 Спасибо за оплату ${user.firstName}, доступно неограниченное количество запросов!`);
    } else {
        logger.warn('Пользователь не найден.');
    }
    // Дополнительная обработка оплаченного инвойса
}


