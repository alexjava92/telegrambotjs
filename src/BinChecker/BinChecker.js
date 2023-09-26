import axios from 'axios';
import {processCardNumber} from "../telegram-bot/botLogic.js";
import {bot} from "../telegram-bot/index.js";

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

    console.log("Успех: " + success);
    console.log("Код: " + code);
    console.log("Действительность: " + valid);
    console.log("Номер: " + number);
    console.log("Схема: " + scheme);
    console.log("Бренд: " + brand);
    console.log("Тип: " + type);
    console.log("Уровень: " + level);
    console.log("Валюта: " + currency);
    console.log("Эмитент: " + name);
    console.log("Страна: " + countryName);

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

    bot.sendMessage(chatId, cardDetailsMessage);



}
export async function displayCardInfo(rawCardNumber, chatId) {
    if (typeof rawCardNumber !== 'string') {
        console.error('displayCardInfo received a non-string value:', rawCardNumber);
        return;
    }

    const cleanedCardNumber = rawCardNumber.replace(/\D/g, ''); // Удаляем все нецифровые символы
    const firstSixDigits = cleanedCardNumber.substring(0, 6);
    const cardInfo = await getCardInfo(firstSixDigits);

    console.log("Получил значение: ");
    console.log(cardInfo);
    logCardDetails(cardInfo, chatId);
}


// Пример использования:





