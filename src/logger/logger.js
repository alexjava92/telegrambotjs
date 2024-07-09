import winston from 'winston';
import moment from 'moment-timezone';

const moscowTimeFormat = winston.format.printf(({ timestamp, level, message }) => {
    const moscowTime = moment(timestamp).tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss');
    if (typeof message === 'object') {
        return `[${moscowTime}] ${level}: ${JSON.stringify(message, null, 2)}`;
    }
    return `[${moscowTime}] ${level}: ${message}`;
});

const customLevels = {
    error: 0,
    warn: 1,
    info: 2,
    SQL: 3,
    API: 4
};

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    SQL: 'cyan',
    API: 'blue'
});

const logger = winston.createLogger({
    levels: customLevels,
    level: 'API',
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