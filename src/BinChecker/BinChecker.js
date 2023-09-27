import axios from 'axios';

import {bot} from "../telegram-bot/index.js";
import {logger} from "../logger/logger.js";

//Подключение к API проверки карт
async function getCardInfo(cardNumber) {
    const options = {
        method: 'POST',
        url: 'https://bin-ip-checker.p.rapidapi.com/',
        params: {bin: cardNumber},
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': 'e922e4bb2bmsh925cf5087efaa8dp162799jsn44e6baa8bcd9',
            'X-RapidAPI-Host': 'bin-ip-checker.p.rapidapi.com'
        },
        data: {bin: cardNumber}
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

//
function logCardDetails(cardInfo, chatId) {
    const {
        success,
        code,
        BIN: {
            valid,
            number,
            scheme,
            brand,
            type,
            level,
            currency,
            issuer: {name},
            country: {name: countryName}
        }
    } = cardInfo;

    logger.info("Успех: " + success);
    logger.info("Код: " + code);
    logger.info("Действительность: " + valid);
    logger.info("Номер: " + number);
    logger.info("Схема: " + scheme);
    logger.info("Бренд: " + brand);
    logger.info("Тип: " + type);
    logger.info("Уровень: " + level);
    logger.info("Валюта: " + currency);
    logger.info("Эмитент: " + name);
    logger.info("Страна: " + countryName);

    const cardDetailsMessage = `
Успех: ${success}
Код: ${code}
Действительность: ${valid}
Номер: ${number}
Схема: ${scheme}
Бренд: ${brand}
Тип: ${type}
Уровень: ${level}
Валюта: ${currency}
Эмитент: ${name}
Страна: ${countryName}
`;


    //  bot.sendMessage(chatId, cardDetailsMessage);

    return cardDetailsMessage;
}

export async function displayCardInfo(rawCardNumber, chatId) {
    if (typeof rawCardNumber !== 'string') {
        logger.error('displayCardInfo received a non-string value:', rawCardNumber);
        return;
    }

    const cleanedCardNumber = rawCardNumber.replace(/\D/g, ''); // Удаляем все нецифровые символы
    const firstSixDigits = cleanedCardNumber.substring(0, 6); //обрезаем и оставляем первые 6 цифр карты
    const cardInfo = await getCardInfo(firstSixDigits);

    logger.info(`"Получил значение: " ${cardInfo}`);

    return logCardDetails(cardInfo, chatId);
}


// Пример использования:





