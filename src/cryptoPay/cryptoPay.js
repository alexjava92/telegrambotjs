import { CryptoPay, Assets } from '@foile/crypto-pay-api';
import {getPrice, insertData, updateData} from "../database/coursesBD.js";

const cryptoPay = new CryptoPay('175443:AAf3emNkIvlWTgKIzjG7WR42g32biNJOSgZ', {
    hostname: 'pay.crypt.bot',
    protocol: 'https'
});

// Функция для выставления счета
export async function createInvoice(amount, currency, description) {
    try {
        // Создаем новый инвойс
        const invoice = await cryptoPay.createInvoice(currency, amount.toString(), {
            description,
        });
        console.log(invoice)

        console.log('Счет успешно создан!');
        console.log(`Ссылка для оплаты: ${invoice.bot_invoice_url}`);
        console.log(`Сумма: ${amount} ${currency}`);
        console.log(`Описание: ${description}`);

        return invoice;
    } catch (error) {
        console.error('Ошибка при создании счета:', error);
        throw error;
    }
}

// Обновление рейтов валют
export const updateRubRates = async () => {
    const getExchangeRates = await cryptoPay.getExchangeRates();
    const rubRates = getExchangeRates.filter(rate => rate.target === 'RUB');
    try {
        for (const rate of rubRates) {
            const { source, target, rate: price } = rate;
            const currencyId = target; // Здесь target всегда 'RUB'
            const currencyName = source;

            await updateData(currencyId, currencyName, price);
            console.log(`Данные для ${currencyName} успешно обновлены в таблице courses`);
        }
    } catch (err) {
        console.error('Ошибка при обновлении данных:', err);
    }
};

//Добавления новых рейтов
export const insertRubRates = async (rubRates) => {
    try {
        for (const rate of rubRates) {
            const { source, target, rate: price } = rate;
            const currencyId = target; // Здесь нужно определить соответствующий id для каждой валюты
            const currencyName = source;
            const isActive = true;

            await insertData(currencyId, currencyName, isActive, price);
            console.log(`Данные для ${currencyName} успешно добавлены в таблицу courses`);
        }
    } catch (err) {
        console.error('Ошибка при добавлении данных:', err);
    }
};

export const getRates = async () => {
    const rates = {
        BTC: await getPrice('RUB', 'BTC'),
        TON: await getPrice('RUB', 'TON'),
        ETH: await getPrice('RUB', 'ETH'),
        USDT: await getPrice('RUB', 'USDT'),
        USDC: await getPrice('RUB', 'USDC'),
        BNB: await getPrice('RUB', 'BNB'),
        GRAM: await getPrice('RUB', 'GRAM'),
        LTC: await getPrice('RUB', 'LTC'),
        TRX: await getPrice('RUB', 'TRX'),
    };
    return rates;
};


