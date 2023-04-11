// Импортируем библиотеку
import pkg from 'pg';

const {Client} = pkg;

// Создаем экземпляр клиента с параметрами подключения
/*const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gpt',
    password: 'Cjprvsyp040592',
    port: 5432,
});*/

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

// Проверка - существует ли пользователь в БД
export async function runUserExist(id) {
    let result

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });
    try {


    // Подключаемся к базе данных
    await client.connect()
    console.log('Соединение с БД открыто.')
    // Выполняем SQL-запрос
    const query = {
        text: 'SELECT * FROM usergpt WHERE chatid = $1',
        values: [id],
    };
    const res = await client.query(query)


    if (res.rowCount > 0) {
        // console.log('Пользователь существует')
        result = 'Пользователь существует'
    } else {
        result = 'Пользователья не существует'
        // console.log('Пользователья не существует')
    }
    }catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.')
    }

    return result

}

/*
runUserExist(123456)
    .then(rows => console.log(rows))
    .catch(err => console.error(err));
*/

//Добавление нового пользователя в БД
export async function addNewUser(id, username, firstName) {
    let result;

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'INSERT INTO usergpt (chatid, username, first_name) VALUES ($1, $2, $3)',
            values: [id, username, firstName],
        };
        const res = await client.query(query);


        if (res.rowCount > 0) {
            // console.log('Пользователь существует')
            result = 'Пользователь добавлен';
        } else {
            result = 'Пользователь не добавлен';
            // console.log('Пользователья не существует')
        }

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');
    }
    return result;
}

//Добавление новго текста в БД в столбец текст
export async function addNewText(id, userText) {
    let result;
    let text = JSON.stringify(userText)
    console.log('приходит '+ typeof text)
    console.log(text)

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'UPDATE usergpt SET messaget_text = $1 WHERE chatid = $2',
            values: [text, id],
        };
        console.log('записываем в БД');
        const res = await client.query(query);

        if (res.rowCount > 0) {
            // console.log('Пользователь существует')
            result = 'Текст добавлен';
        } else {
            result = 'Текст не добавлен';
            // console.log('Пользователья не существует')
        }
        console.log(result)
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');
    }
    return result;
}

//Отдает текст из БД из столбца текст
export async function getText(id) {
    let result;
    let result1;

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'SELECT messaget_text FROM usergpt WHERE chatid = $1',
            values: [id],
        };
        const res = await client.query(query);

        //console.log(res.rows)
        result1 = res.rows
        if (res.rowCount > 0) {
            console.log('Текст в массиве есть')
            result = 'Текст в массиве есть';

        } else {
            result = 'Текста в массиве нету';
            console.log('Текста в массиве нету')
        }

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');

    }
    return result1;

}

//Удалем значения из БД из столбца текст
export async function deleteGetText(id) {
    let result;
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });
    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'UPDATE usergpt SET messaget_text = $1 WHERE chatid = $2',
            values: [null, id],
        };
        const res = await client.query(query);

        if (res.rowCount > 0) {
            result = 'Текст удален';
        } else {
            result = 'Текст не удален';
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');
    }
    return result;

}

export async function addStatus(id, userText) {
    let result;

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'UPDATE usergpt SET column_status = $1 WHERE chatid = $2',
            values: [userText, id],
        };
        console.log('записываем в БД');
        const res = await client.query(query);

        if (res.rowCount > 0) {
            // console.log('Пользователь существует')
            result = 'Новый статус установлен: ' + userText;
        } else {
            result = 'Статус не установлен';
            // console.log('Пользователья не существует')
        }
        console.log(result)
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');
    }
    return result;
}

export async function getStatus(id) {
    let result;
    let result1;

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'SELECT column_status FROM usergpt WHERE chatid = $1',
            values: [id],
        };
        const res = await client.query(query);

        console.log(res.rows)
        result1 = res.rows

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');

    }
    return result1;

}

export async function addStatusOne(id, userText) {
    let result;

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'UPDATE usergpt SET column_status_1 = $1 WHERE chatid = $2',
            values: [userText, id],
        };
        console.log('записываем в БД');
        const res = await client.query(query);

        if (res.rowCount > 0) {
            // console.log('Пользователь существует')
            result = 'Новый статус установлен: ' + userText;
        } else {
            result = 'Статус не установлен';
            // console.log('Пользователья не существует')
        }
        console.log(result)
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');
    }
    return result;
}

export async function getStatusOne(id) {
    let result;
    let result1;

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'SELECT column_status_1 FROM usergpt WHERE chatid = $1',
            values: [id],
        };
        const res = await client.query(query);

        console.log(res.rows)
        result1 = res.rows

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        console.log('Соединение с БД закрыто.');

    }
    return result1;

}

//runUserExist(123).then(result => console.log(result))
//addNewUser(123, 'ooopa', 'hopooa').then(result => console.log(result))
//let messages = [{role: "system", content : 'prompt' || 'expletive'}]
//addNewText(194857311, ["hoy hoy"]).then(result => console.log(result))
//getText(194857311).then(result => console.log(result))
//deleteGetText(194857311).then(result => console.log(result))
//addStatusOne(194857311, 'status').then(r => console.log(r))
//getStatusOne(5208745478, 'status').then(r => console.log(r))