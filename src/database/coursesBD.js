import pkg from 'pg';
import {logger} from "../logger/logger.js";

const {Client} = pkg;




export const insertData = async (currency_id, currency_name, is_active, price) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });
    await client.connect();
    try {
        const query = `
            INSERT INTO courses (currency_id, currency_name, is_active, price)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [currency_id, currency_name, is_active, price];
        const result = await client.query(query, values);
        logger.SQL(result);
    } catch (err) {
        logger.error('Error executing query', err);
    } finally {
        await client.end();
    }
};

export const selectData = async () => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });
    await client.connect();
    try {
        const query = `SELECT * FROM courses`;
        const result = await client.query(query);
        logger.info(result.rows);
        return result.rows[0].price
    } catch (err) {
        logger.error(err.stack);
    } finally {
        await client.end();
    }
};

export const updateData = async (currency_id, currency_name, price) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });
    await client.connect();
    try {
        const query = `
            UPDATE courses
            SET price = $1, updated_at = NOW()
            WHERE currency_id = $2 AND currency_name = $3
            RETURNING *
        `;
        const values = [price, currency_id, currency_name];
        const result = await client.query(query, values);
        logger.SQL(`Updated ${result.rowCount} row(s)`, result.rows);
    } catch (err) {
        logger.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
};

export const getPrice = async (currencyId, currencyName) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });
    await client.connect();
    try {
        const query = `
            SELECT price
            FROM courses
            WHERE currency_id = $1 AND currency_name = $2
        `;
        const values = [currencyId, currencyName];
        const result = await client.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0].price;
        } else {
            return null;
        }
    } catch (err) {
        logger.error('Error executing query', err.stack);
        return null;
    } finally {
        await client.end();
    }
};