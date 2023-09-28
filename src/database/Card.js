import pkg from 'pg';
import {logger} from "../logger/logger.js";

const {Client} = pkg;

//добавляет в БД все данные карты
export async function insertCardInfo(cardInfo, cleanedCardNumber) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        await client.connect();

        const query = {
            text: `INSERT INTO card (success, code, valid, number, scheme, brand, type, level, currency, issuer_name, country_name, full_number_card) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            values: [
                cardInfo.success,
                cardInfo.code,
                cardInfo.BIN.valid,
                cardInfo.BIN.number,
                cardInfo.BIN.scheme,
                cardInfo.BIN.brand,
                cardInfo.BIN.type,
                cardInfo.BIN.level,
                cardInfo.BIN.currency,
                cardInfo.BIN.issuer.name,
                cardInfo.BIN.country.name,
                cleanedCardNumber  // добавляем значение cleanedCardNumber в массив значений
            ],
        };

        await client.query(query);
        logger.SQL(`Значения были успешно добавлены в таблицу card.`);
    } catch (error) {
        logger.error('Ошибка при добавлении значений в таблицу card:', error);
    } finally {
        await client.end();
    }
}
// Проверяет есть ли карта в БД
export async function isCardAdded(cleanedCardNumber) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        await client.connect();

        const query = {
            text: `SELECT 1 FROM card WHERE full_number_card = $1 LIMIT 1`,
            values: [cleanedCardNumber]
        };

        const result = await client.query(query);

        // Если в результате что-то найдено, то возвращаем true, иначе false
        return result.rows.length > 0;

    } catch (error) {
        logger.db('Ошибка при проверке наличия карты в таблице card:', error);
        return false;  // По умолчанию возвращаем false в случае ошибки
    } finally {
        await client.end();
    }
}
// Достаем все значение по номеру карты
export async function getCardInfoIfExists(cleanedCardNumber) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        await client.connect();

        const query = {
            text: `
                SELECT 
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
                    full_number_card 
                FROM card 
                WHERE full_number_card = $1 LIMIT 1
            `,
            values: [cleanedCardNumber]
        };

        const result = await client.query(query);

        // Если в результате что-то найдено, возвращаем это значение
        if (result.rows.length > 0) {
            return result.rows[0];  // Первая запись из результатов
        } else {
            return null;  // Карта не найдена
        }

    } catch (error) {
        logger.db('Ошибка при получении информации о карте из таблицы card:', error);
        return null;  // По умолчанию возвращаем null в случае ошибки
    } finally {
        await client.end();
    }
}


