// Ценовые константы для различных моделей OpenAI
import {User} from "../../Users/User.js";
import {bot} from "../../telegram-bot/index.js";
import {logger} from "../../logger/logger.js";
import {callOpenAIModel} from "../chat-gpt.js";
import {getRates} from "../../cryptoPay/cryptoPay.js";

const PRICES = {
    'gpt-3.5-turbo': 0.002, // $0.002 за 1000 токенов
    'gpt-4': 0.03, // $0.03 за 1000 токенов
    'dall-e-2': 0.02, // $0.02 за изображение 1024x1024
    'dall-e-3': 0.04, // $0.04 за изображение 1024x1024
    'dall-e-3-standard': 0.04, // $0.04 за изображение 1024x1024
    'dall-e-3-hd': 0.08, // $0.08 за изображение 1024x1024
    'whisper': 0.006, // $0.006 за минуту аудио
    'tts': 15, // $15 за 1M символов
    'tts-hd': 30 // $30 за 1M символов
};

// Функция для округления количества токенов до ближайшего целого
function roundTokens(tokens) {
    return Math.round(tokens);
}

// Функция для расчета стоимости использования модели
function calculateCost(model, usage) {
    const price = PRICES[model];
    if (!price) {
        throw new Error(`Unsupported model: ${model}`);
    }

    switch (model) {
        case 'gpt-3.5-turbo':
        case 'gpt-4':
            return (roundTokens(usage) / 1000) * price;
        case 'dall-e-2':
        case 'dall-e-3':
        case 'dall-e-3-standard':
        case 'dall-e-3-hd':
            return price;
        case 'whisper':
            return (usage / 60) * price;
        case 'tts':
        case 'tts-hd':
            return (roundTokens(usage) / 1000000) * price;
        default:
            throw new Error(`Unsupported model: ${model}`);
    }
}

// Функция для обновления баланса пользователя и проверки достаточности средств
async function updateUserBalance(chatId, cost) {
    const user = User.getUser(chatId);
    const userBalance = await user.getBalance;
    if (userBalance < cost) {
        // Уведомить пользователя о необходимости пополнить баланс
        bot.sendMessage(chatId, 'Не достаточно средств, пожалуйста пополните баланс.');
        return false;
    }

    await deductBalanceForUser(chatId, cost);
    return true;
}

// Функция для использования модели OpenAI
export async function useOpenAIModel(chatId, model, usage, prompt) {
    const cost = calculateCost(model, usage);
    if (!await updateUserBalance(chatId, cost)) {
        // Недостаточно средств, ограничить ответ
        return 'Недостаточно средств на балансе. Пожалуйста, пополните баланс.';
    }

    // Использовать модель OpenAI и вернуть результат
    const result = await callOpenAIModel(model, usage, prompt);
    return result;
}

const deductBalanceForUser = async (chatId, cost) => {
    const user = await User.getUser(chatId);
    if (user) {
        const rates = await getRates();
        const rubToUsd = 1 / rates.USDT; // Курс рубля к доллару

        const balance = await user.getBalance();
        const balanceInUsd = balance * rubToUsd; // Перевод баланса в доллары

        const subtractionBalance = balanceInUsd - cost;

        const newBalanceInRub = Math.round(subtractionBalance / rubToUsd); // Перевод обратно в рубли
        await user.setBalance(newBalanceInRub);

        logger.info(`Списание с баланса пользователя ${user.firstname} суммы ${cost} долларов`);
    } else {
        logger.warn('Пользователь не найден.');
    }
}

