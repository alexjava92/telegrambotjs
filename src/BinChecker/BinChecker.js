import axios from 'axios';

import {bot} from "../telegram-bot/index.js";
import {logger} from "../logger/logger.js";
import {getCardInfoIfExists, insertCardInfo, isCardAdded} from "../database/Card.js";

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
        logger.API("Успешный запрос к API проверки карт")
        return response.data;

    } catch (error) {
        logger.error(error);
    }
}

//логика сообщения для отправки пользователю о карте
async function logCardDetails(cardInfo) {
    let {
        success,
        code,
        valid,
        number,
        scheme,
        brand,
        type,
        level,
        currency,
        issuer_name,
        country_name,
        full_number_card,
        BIN
    } = cardInfo;

    if (BIN) {
        valid = BIN.valid;
        number = BIN.number;
        scheme = BIN.scheme;
        brand = BIN.brand;
        type = BIN.type;
        level = BIN.level;
        currency = BIN.currency;
        issuer_name = BIN.issuer.name;
        country_name = BIN.country.name;
    }

    logger.info("Успех: " + success);
    logger.info("Код: " + code);
    logger.info("Действительность: " + valid);
    logger.info("Номер: " + number);
    logger.info("Схема: " + scheme);
    logger.info("Бренд: " + brand);
    logger.info("Тип: " + type);
    logger.info("Уровень: " + level);
    logger.info("Валюта: " + currency);
    logger.info("Эмитент: " + issuer_name);
    logger.info("Страна: " + country_name);
    if (full_number_card) {
        logger.info("Полный номер карты: " + full_number_card);
    }

    const cardDetailsMessage = `
Действительность: ${valid}
Номер: ${number}
Схема: ${scheme}
Бренд: ${brand}
Тип: ${type}
Уровень: ${level}
Валюта: ${currency}
Эмитент: ${issuer_name}
Страна: ${country_name}
${full_number_card ? "Полный номер карты: " + full_number_card : ""}
`;

    return cardDetailsMessage;
}


export async function displayCardInfo(rawCardNumber, chatId) {
    if (typeof rawCardNumber !== 'string') {
        logger.error('displayCardInfo received a non-string value:', rawCardNumber);
        return;
    }

    const cleanedCardNumber = rawCardNumber.replace(/\D/g, ''); // Удаляем все нецифровые символы
    const firstSixDigits = cleanedCardNumber.substring(0, 6); //обрезаем и оставляем первые 6 цифр карты


    //проверяем есть ли карта в БД
    if (!await isCardAdded(cleanedCardNumber)){
        //добавляем карту в БД
        const cardInfo = await getCardInfo(firstSixDigits);
        logger.info(`"Получил значение: " ${cardInfo}`);
        await insertCardInfo(cardInfo, cleanedCardNumber)

        return logCardDetails(cardInfo);
    }

    //Если карта уже есть в БД достаем её.
    const infoCard = await getCardInfoIfExists(cleanedCardNumber)



    return logCardDetails(infoCard);
}








