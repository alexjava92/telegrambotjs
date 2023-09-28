import winston from 'winston';
import moment from 'moment-timezone';

const moscowTimeFormat = winston.format.printf(({ timestamp, level, message }) => {
    const moscowTime = moment(timestamp).tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss');
    return `[${moscowTime}] ${level}: ${message}`;
});

const customLevels = {
    error: 0,
    warn: 1,
    info: 2,
    SQL: 3,
    API: 4 // добавлен новый уровень "test"
};

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    SQL: 'cyan',
    API: 'blue' // добавлен цвет для уровня "test"
});

const logger = winston.createLogger({
    levels: customLevels,
    level: 'API',  // устанавливаем уровень логирования по умолчанию
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
