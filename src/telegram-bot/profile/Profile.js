import {bot} from "../index.js";
import {getPrice} from "../../database/coursesBD.js";

const options = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [
                {text: 'Пополнить баланс', callback_data: 'buy_subscription'},
                {text: 'Тарифы', callback_data: 'show_plans'}]
        ],

    }
};


export const Profile = async (user) => {
    const courses = await getPrice('RUB', 'USDT');
    const profileInfo = `
➖ ID: \`${user.id}\`
➖ ChatID: \`${user.chatId}\`

➖ Статус подписки: \`${user.subscriptionStatus}\`
➖ Дата окончания подписки: \`${new Date(user.subscriptionEndDate).toLocaleString()}\`

💲 Баланс: \`${user.balance}\` RUB \`${(user.balance / courses).toFixed(2)}\` USD`;

// Отправляем информацию о профиле пользователю
    bot.sendMessage(user.chatId, profileInfo, options);
}