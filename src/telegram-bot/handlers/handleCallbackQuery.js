import {createInvoice, getRates} from "../../cryptoPay/cryptoPay.js";
import {checkingYourSubscription} from "../botLogic.js";
import {getStatusOne} from "../../database/database.js";
import {User} from "../../Users/User.js";
import {sendInvoice} from "../payment/paymentYandex.js";
import {logger} from "../../logger/logger.js";
import {Profile} from "../profile/Profile.js";
import {insertInvoice} from "../../database/cryptoPayBD.js";

export async function handleCallbackQuery(callbackQuery, bot) {

    const callbackQueryId = callbackQuery.id;

    // Ваша логика обработки callback запросов
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    const createPaymentButtons = async (amount, chatId) => {
        const rates = await getRates(); // Получаем текущие курсы валют

        // Создаем массив кнопок с валютами
        const buttons = Object.entries(rates).map(([currency, rate]) => {
            let cryptoAmount;
            if (currency === 'USDT' || currency === 'USDC') {
                cryptoAmount = (amount / rate).toFixed(2); // Округляем до 2 знаков для USDT и USDC
            } else {
                cryptoAmount = (amount / rate).toFixed(8); // Для других валют округляем до 8 знаков
            }
            return {
                text: `${currency} - ${cryptoAmount} (${amount}) руб.`,
                callback_data: `pay_${currency}_${cryptoAmount}_${chatId}`,
            };
        });

        // Создаем объект options с клавиатурой
        const options = {
            reply_markup: {
                inline_keyboard: buttons.map((button) => [button]),
            },
        };

        return options;
    };

    const handleButtonClick = async (callbackQuery) => {
        console.log('Запускается', callbackQuery);

        const callbackData = callbackQuery.data;
        const [action, currency, amount, chatId] = callbackData.split('_');

        if (action === 'pay') {

            try {
                console.log('Выполняется pay');
                const invoice = await createInvoice(amount, currency, chatId);
                if (invoice) {

                    // Изменяем предыдущее сообщение от бота с кнопками для оплаты
                    const messageWithPaymentButtons = callbackQuery.message;
                    await bot.editMessageText(
                        `Ссылка для оплаты: ${invoice.bot_invoice_url}`,
                        {
                            chat_id: chatId,
                            message_id: messageWithPaymentButtons.message_id,
                            disable_web_page_preview: true,
                        }
                    );
                    await insertInvoice(invoice);

                    // Или удаляем предыдущее сообщение от бота с кнопками для оплаты
                    // await bot.deleteMessage(chatId, messageWithPaymentButtons.message_id);

                   // await bot.answerCallbackQuery(callbackQuery);
                } else {
                    console.error('createInvoice вернула undefined или null');
                }
            } catch (error) {
                console.error('Ошибка при создании счета:', error);
            }
        }
    };

    if (action.startsWith('pay_')) {
        console.log('Выполняется')
        await handleButtonClick(callbackQuery);
    }

    if (action === 'checking_your_subscription') {
        await checkingYourSubscription(chatId)
        const st = await getStatusOne(chatId);
        const status_1 = st[0].column_status_1;
        if (status_1 === 'yes_subscription') {
            await bot.sendMessage(chatId, '😊 Спасибо, за подписку! Вы можете использовать функционал бота. Напишите что-нибудь, например: Первый человек на луне?');
        } else
            await bot.sendMessage(chatId, 'Вы не подписались 😔');
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: ''
        });
        return;
    }
    if (action === 'buy_subscription') {
        const options = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    // [{text: 'Оплата переводом', callback_data: 'buy_subscription1'}],
                    [{text: '💳 Оплата картой', callback_data: 'buy_subscription2'}],

                ]
            }
        };
        const messageWithPaymentButtons = callbackQuery.message;
        await bot.editMessageText(
            'Напишите сумму пополнения минимум 200 руб.',
            {
                chat_id: chatId,
                message_id: messageWithPaymentButtons.message_id,
            }
        );
        const user = await User.getUser(chatId);
        await user.setUserStatus('payment_amount')

        /*await bot.sendMessage(chatId, "Доступные методы оплаты:", options);*/
        await bot.answerCallbackQuery(callbackQueryId);

    }
    if (action === 'buy_subscription2') {
        const user = await User.getUser(chatId);
        const amount = await user.getPaymentAmount();
        const prevMessageId = callbackQuery.message;
        await sendInvoice(chatId, amount, prevMessageId);
        await bot.answerCallbackQuery(callbackQueryId);
    }
    if (action === 'buy_subscription_crypto') {
        const user = await User.getUser(chatId);
        const amount = await user.getPaymentAmount();
        const keyboard = await createPaymentButtons(amount, chatId);
        /*const messageWithPaymentButtons = callbackQuery.message_id;
        await bot.deleteMessage(chatId, messageWithPaymentButtons);*/
        await bot.sendMessage(chatId, 'Выберите валюту для оплаты:',  keyboard );
        await bot.answerCallbackQuery(callbackQueryId);
    }
    if (action === 'show_plans') {
        // Здесь вы можете отправить сообщение с информацией о тарифах
        await bot.sendMessage(chatId, 'Информация временно отсутствует.');
        try {
            await bot.answerCallbackQuery(callbackQueryId);
        } catch (error) {
            logger.error(error.message)
        }

    }
    if (action === 'show_profile') {
        logger.info('запустился show_profile')
        const user = await User.getUser(chatId);
        await Profile(user);
    }
}