import pkg from 'pg';
import {logger} from "../logger/logger.js";

const {Client} = pkg;

export const insertInvoice = async (invoice) => {
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
            INSERT INTO cryptoPay (
                chatId,
                invoiceId,
                hash,
                currencyType,
                asset,
                amount,
                payUrl,
                botInvoiceUrl,
                description,
                status,
                createdAt,
                allowComments,
                allowAnonymous
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const values = [
            invoice.chatId || invoice.description, // chatId
            invoice.invoice_id, // invoiceId
            invoice.hash, // hash
            invoice.currency_type, // currencyType
            invoice.asset, // asset
            invoice.amount, // amount
            invoice.pay_url, // payUrl
            invoice.bot_invoice_url, // botInvoiceUrl
            invoice.description, // description
            invoice.status, // status
            invoice.created_at, // createdAt
            invoice.allow_comments, // allowComments
            invoice.allow_anonymous, // allowAnonymous
        ];
        const result = await client.query(query, values);
        logger.SQL(result.rowCount);
    } catch (err) {
        logger.error('Error executing query', err);
    } finally {
        await client.end();
    }
};

export const updatePaidInvoice = async (invoice) => {
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
            UPDATE cryptoPay
            SET paidAsset = $1,
                paidAmount = $2,
                feeAsset = $3,
                feeAmount = $4,
                status = $5,
                paidUsdRate = $6,
                usdRate = $7,
                paidAt = $8,
                paidAnonymously = $9
            WHERE invoiceId = $10
            RETURNING *
        `;
        const values = [
            invoice.paid_asset,
            invoice.paid_amount,
            invoice.fee_asset,
            invoice.fee_amount,
            invoice.status,
            invoice.paid_usd_rate,
            invoice.usd_rate,
            invoice.paid_at,
            invoice.paid_anonymously,
            invoice.invoice_id,
        ];
        const result = await client.query(query, values);
        logger.SQL(result.rowCount);
    } catch (err) {
        logger.error('Error executing query', err);
    } finally {
        await client.end();
    }
};