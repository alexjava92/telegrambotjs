import winston from 'winston';
import moment from 'moment-timezone';

const moscowTimeFormat = winston.format.printf(({ timestamp, level, message }) => {
    const moscowTime = moment(timestamp).tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss');
    return `[${moscowTime}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        moscowTimeFormat
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

export { logger };
