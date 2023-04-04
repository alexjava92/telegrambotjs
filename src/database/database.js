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
/*async function runUserExist() {
    let result = '';
    // Подключаемся к базе данных
    await client.connect();

    // Выполняем SQL-запрос
    const res = await client.query('SELECT * FROM usergpt WHERE chatid = 123456;');

    // Выводим результат на экран
    console.log(res.rows);

    // Закрываем соединение
    await client.end();

    if (res.rowCount > 0) {
        // console.log('Пользователь существует')
        result = 'Пользователь существует'
    } else {
        result = 'Пользователья не существует'
        // console.log('Пользователья не существует')
    }
    return result;
}*/

/*runUserExist().then(result => {
    console.log(result);
    if (result === 'Пользователь существует'){
        console.log('ура работает')
    }else if(result !== ""){
        console.log("не работает")
    }
});*/

async function runUserExist(id) {
    let result = '';
    // Подключаемся к базе данных
    await client.connect();
    // Выполняем SQL-запрос
    const query = {
        text: 'SELECT * FROM usergpt WHERE chatid = $1',
        values: [id],
    };
    const res = await client.query(query);
    await client.end();
    if (res.rowCount > 0) {
        // console.log('Пользователь существует')
        result = 'Пользователь существует'
    } else {
        result = 'Пользователья не существует'
        // console.log('Пользователья не существует')
    }
    return result;

}
/*
runUserExist(123456)
    .then(rows => console.log(rows))
    .catch(err => console.error(err));
*/

//Добавление нового пользователя в БД
async function addNewUser(id, username, firstName) {
    let result;
    // Подключаемся к базе данных
    await client.connect();
    // Выполняем SQL-запрос
    const query = {
        text: 'INSERT INTO usergpt (chatid, username, first_name) VALUES ($1, $2, $3)',
        values: [id, username, firstName]
    };
    const res = await client.query(query);
    await client.end();
    if (res.rowCount > 0) {
        // console.log('Пользователь существует')
        result = 'Пользователь добавлен'
    } else {
        result = 'Пользователь не добавлен'
        // console.log('Пользователья не существует')
    }
    return result;

}

addNewUser(123, 'opa', 'hopa').then(result => console.log(result))



