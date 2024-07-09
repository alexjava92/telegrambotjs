import Freecurrencyapi from "@everapi/freecurrencyapi-js";
import { config } from "dotenv";
import { insertData, updateData } from "../../../database/coursesBD.js";
import { logger } from "../../../logger/logger.js";

config({ path: '../../.env' });
const apiKey = process.env.FREECURRENCYAPI;
const freecurrencyapi = new Freecurrencyapi(apiKey);

const fetchCurrencyRate = async () => {
    try {
        const RUB_USD = await freecurrencyapi.latest({
            base_currency: 'USD',
            currencies: 'RUB'
        });

        const currency_id = 'RUB';
        const price = RUB_USD.data.RUB.toFixed(2);

        return { currency_id, price };
    } catch (err) {
        logger.error('Error fetching currency rate', err.stack);
        throw err;
    }
};

export const fetchAndInsertCurrencyRate = async () => {
    try {
        const { currency_id, price } = await fetchCurrencyRate();
        const currency_name = 'Russian Ruble';
        const is_active = true;

        logger.info(price);

        await insertData(currency_id, currency_name, is_active, price);
    } catch (err) {
        logger.error('Error inserting currency rate', err.stack);
    }
};

export const updateCurrencyRate = async () => {
    try {
        const { currency_id, price } = await fetchCurrencyRate();

        await updateData(currency_id, price);
    } catch (err) {
        logger.error('Error updating currency rate', err.stack);
    }
};

