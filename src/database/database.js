// Импортируем библиотеку
import pkg from 'pg';
const {Client} = pkg;


// Создаем экземпляр клиента с параметрами подключения
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gpt',
    password: 'Cjprvsyp040592',
    port: 5432,
});

// Функция для подключения и выполнения запроса
async function runQuery() {
    try {
        // Подключаемся к базе данных
        await client.connect();

        // Выполняем SQL-запрос
        const res = await client.query('SELECT * FROM usergpt');

        // Выводим результат на экран
        console.log(res.rows);

        // Закрываем соединение
        await client.end();
    } catch (err) {
        console.error(err);
    }
}

// Вызываем функцию
//runQuery();

// Проверка - существует ли пользователь в БД
