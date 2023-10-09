// Импортируем библиотеку
import pkg from 'pg';
import {logger} from "../logger/logger.js";

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
        logger.info(res.rows);

        // Закрываем соединение
        await client.end();
    } catch (err) {
        console.error(err);
    }
}

//Отдает idUser нормер пользователя из БД
export async function getIdUser(id) {
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
        // console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'SELECT id FROM usergpt WHERE chatid = $1',
            values: [id],
        };
        const res = await client.query(query);

        //console.log(res.rows)
        result1 = res.rows
        if (res.rowCount > 0) {
            //console.log('Текст в массиве есть')
            result = 'Текст в массиве есть';

        } else {
            result = 'Текста в массиве нету';
            // console.log('Текста в массиве нету')
        }

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
        // console.log('Соединение с БД закрыто.');

    }
    return result1;

}

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
   // console.log('Соединение с БД открыто.')
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
        logger.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
      //  console.log('Соединение с БД закрыто.')
    }

    return result

}

// Здесь ваш код для обновления userName и firstName на основе chatId в базе данных.
export async function updateUserNameAndFirstName(chatId, userName, firstName) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    let result;

    try {
        await client.connect();

        const query = {
            text: 'UPDATE usergpt SET username = $1, first_name = $2 WHERE chatid = $3',
            values: [userName, firstName, chatId],
        };
        const res = await client.query(query);

        if (res.rowCount > 0) {
            result = 'Данные пользователя обновлены';
        } else {
            result = 'Пользователь не найден';
        }

    } catch (error) {
        logger.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
    }

    return result;
}

export async function getUserDetailsFromDB(chatId) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    let userDetails;

    try {
        await client.connect();

        // Измените запрос, чтобы также выбирать нужные значения
        const query = {
            text: 'SELECT username, first_name, last_response_date, subscription_status, response_count FROM usergpt WHERE chatid = $1',
            values: [chatId],
        };
        const res = await client.query(query);

        if (res.rowCount > 0) {
            userDetails = {
                userName: res.rows[0].username,
                firstName: res.rows[0].first_name,
                last_response_date: res.rows[0].last_response_date,
                subscription_status: res.rows[0].subscription_status,
                response_count: res.rows[0].response_count
            };
        }

    } catch (error) {
        logger.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
    }

    return userDetails;
}

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

        // Выполняем SQL-запрос
        const query = {
            text: 'INSERT INTO usergpt (chatid, username, first_name, response_count, subscription_status, last_response_date) VALUES ($1, $2, $3, $4, $5, $6)',
            values: [id, username, firstName, 0, 'active', new Date().toISOString().slice(0, 10)],
        };
        const res = await client.query(query);

        if (res.rowCount > 0) {
            result = 'Пользователь добавлен';
        } else {
            result = 'Пользователь не добавлен';
        }

    } catch (error) {
        logger.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
    }
    return result;
}

//Добавление нового текста в БД в столбец текст
export async function addNewText(id, userText) {
    let result;
    let text = JSON.stringify(userText)

    //console.log(text)

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
       // console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'UPDATE usergpt SET messaget_text = $1 WHERE chatid = $2',
            values: [text, id],
        };
       // console.log('записываем в БД');
        const res = await client.query(query);

        if (res.rowCount > 0) {
            // console.log('Пользователь существует')
            result = 'Текст добавлен';
        } else {
            result = 'Текст не добавлен';
            // console.log('Пользователья не существует')
        }
      //  console.log(result)
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
     //   console.log('Соединение с БД закрыто.');
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
       // console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'SELECT messaget_text FROM usergpt WHERE chatid = $1',
            values: [id],
        };
        const res = await client.query(query);

        //console.log(res.rows)
        result1 = res.rows
        if (res.rowCount > 0) {
            //console.log('Текст в массиве есть')
            result = 'Текст в массиве есть';

        } else {
            result = 'Текста в массиве нету';
           // console.log('Текста в массиве нет')
        }

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
       // console.log('Соединение с БД закрыто.');

    }
    return result1;

}

//Удаляем значения из БД из столбца текст
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
       // console.log('Соединение с БД открыто.');
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
      //  console.log('Соединение с БД закрыто.');
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
      //  console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'UPDATE usergpt SET column_status = $1 WHERE chatid = $2',
            values: [userText, id],
        };
      //  console.log('записываем в БД');
        const res = await client.query(query);

        if (res.rowCount > 0) {
            // console.log('Пользователь существует')
            result = 'Новый статус установлен: ' + userText;
        } else {
            result = 'Статус не установлен';
            // console.log('Пользователя не существует')
        }
       // console.log(result)
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
       // console.log('Соединение с БД закрыто.');
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
      //  console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'SELECT column_status FROM usergpt WHERE chatid = $1',
            values: [id],
        };
        const res = await client.query(query);

      //  console.log(res.rows)
        result1 = res.rows

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
      //  console.log('Соединение с БД закрыто.');

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
     //   console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'UPDATE usergpt SET column_status_1 = $1 WHERE chatid = $2',
            values: [userText, id],
        };
       // console.log('записываем в БД');
        const res = await client.query(query);

        if (res.rowCount > 0) {
            // console.log('Пользователь существует')
            result = 'Новый статус установлен: ' + userText;
        } else {
            result = 'Статус не установлен';
            // console.log('Пользователья не существует')
        }
      //  console.log(result)
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
      //  console.log('Соединение с БД закрыто.');
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
       // console.log('Соединение с БД открыто.');
        // Выполняем SQL-запрос
        const query = {
            text: 'SELECT column_status_1 FROM usergpt WHERE chatid = $1',
            values: [id],
        };
        const res = await client.query(query);

      //  console.log(res.rows)
        result1 = res.rows

    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    } finally {
        await client.end();
      //  console.log('Соединение с БД закрыто.');

    }
    return result1;

}

// устанавливаем 0 в счетчике response_count
export async function resetResponseCount(chatId) {
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
            text: 'UPDATE usergpt SET response_count = 0, last_response_date = CURRENT_DATE WHERE chatid = $1',
            values: [chatId],
        };

        await client.query(query);
    } catch (error) {
        logger.error('Ошибка при выполнении запроса resetResponseCount:', error);
    } finally {
        await client.end();
    }
}

export async function incrementResponseCount(chatId) {
    console.log("Inside incrementResponseCount for chatId:", chatId);

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
            text: 'UPDATE usergpt SET response_count = response_count + 1 WHERE chatid = $1',
            values: [chatId],
        };

        const result = await client.query(query);
        // Если вы хотите логировать результат запроса, используйте переменную result.
        // Например: logger.info('Result:', JSON.stringify(result));
        logger.info('Rows updated:', result.rowCount);

    } catch (error) {
        logger.error('Ошибка при выполнении запроса incrementResponseCount:', error);
    } finally {
        await client.end();
    }
}

export async function getResponseCount(chatId) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    let responseCount = null;

    try {
        await client.connect();

        const query = {
            text: 'SELECT response_count FROM usergpt WHERE chatid = $1',
            values: [chatId],
        };

        const result = await client.query(query);

        if (result.rows && result.rows.length > 0) {
            responseCount = result.rows[0].response_count;
        } else {
            logger.error(`No user found for chatId: ${chatId}`);
        }
    } catch (error) {
        logger.error('Ошибка при получении response_count:', error);
    } finally {
        await client.end();
    }

    return responseCount;
}

export async function setResponseCount(chatId, newCount) {
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
            text: 'UPDATE usergpt SET response_count = $1 WHERE chatid = $2',
            values: [newCount, chatId],
        };

        await client.query(query);
        console.log("запрос ушел " + newCount )

        logger.info(`Response count for chatId ${chatId} set to: ${newCount}`);
    } catch (error) {
        logger.error('Ошибка при установке response_count:', error);
    } finally {
        await client.end();
    }
}

export async function setInitialValuesForUser(chatId) {
    let result;

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        await client.connect();

        // Проверка наличия пользователя в базе данных
        const checkQuery = {
            text: 'SELECT * FROM usergpt WHERE chatid = $1',
            values: [chatId],
        };

        const checkRes = await client.query(checkQuery);

        if (checkRes.rowCount === 0) {
            // Если пользователь не существует, добавляем его с начальными значениями
            const insertQuery = {
                text: 'INSERT INTO usergpt (chatid, response_count, subscription_status, last_response_date) VALUES ($1, $2, $3, $4) RETURNING *',
                values: [chatId, 0, 'inactive', new Date().toISOString().slice(0, 10)],
            };

            const insertRes = await client.query(insertQuery);
            if (insertRes.rowCount > 0) {
                result = 'Стартовые значения установлены';
            } else {
                result = 'Ошибка при установке стартовых значений';
            }
        } else {
            // Если пользователь существует, обновляем счетчик и дату последнего ответа, оставив статус подписки без изменений
            const updateQuery = {
                text: 'UPDATE usergpt SET response_count = $1, last_response_date = $2 WHERE chatid = $3',
                values: [0, new Date().toISOString().slice(0, 10), chatId],
            };

            await client.query(updateQuery);
            result = 'Стартовые значения обновлены';
        }
    } catch (error) {
        logger.error('Ошибка при установке или обновлении стартовых значений:', error);
    } finally {
        await client.end();
    }
    return result;
}

//Меняем статус subscription_status на active
export async function setSubscriptionActive(chatId) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592', // Настоятельно рекомендую использовать более безопасный способ хранения паролей!
        port: 5432,
    });

    try {
        // Подключаемся к базе данных
        await client.connect();
        logger.info('Соединение с БД открыто.');

        // Запрос на обновление статуса подписки
        const query = {
            text: 'UPDATE usergpt SET subscription_status = $1 WHERE chatid = $2',
            values: ['active', chatId],
        };

        await client.query(query);
        logger.info('Статус подписки обновлен.');

    } catch (error) {
        logger.error('Ошибка при обновлении статуса подписки:', error);
    } finally {
        await client.end();
        logger.info('Соединение с БД закрыто.');
    }
}

//Устанавливаем дату окончания подписки
export async function setSubscriptionEndDate(chatId) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    const currentDate = new Date();
    const subscriptionEndDate = new Date(currentDate);
    subscriptionEndDate.setDate(currentDate.getDate() + 30); // добавляем 30 дней к текущей дате

    try {
        await client.connect();
        const query = {
            text: 'UPDATE usergpt SET subscription_end_date = $1 WHERE chatid = $2',
            values: [subscriptionEndDate, chatId],
        };
        await client.query(query);
        logger.info(`Установлена дата окончания подписки для пользователя с ID: ${chatId}`);
    } catch (error) {
        logger.error('Ошибка при установке даты окончания подписки:', error);
    } finally {
        await client.end();
    }
}

//Устанавливаем статус inactive для законченной подписки
export async function checkAndSetSubscriptionStatus() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'gpt',
        password: 'Cjprvsyp040592',
        port: 5432,
    });

    try {
        await client.connect();

        // Выбрать всех пользователей, у которых текущая дата больше subscription_end_date
        const usersQuery = 'SELECT chatid FROM usergpt WHERE CURRENT_DATE > subscription_end_date AND subscription_status = \'active\'';
        const usersResult = await client.query(usersQuery);

        if (usersResult.rowCount === 0) {
            logger.info('Все подписки активны или уже были установлены в неактивное состояние.');
            return;
        }

        // Установить subscription_status = 'inactive' для выбранных пользователей
        const updateQuery = 'UPDATE usergpt SET subscription_status = \'inactive\' WHERE CURRENT_DATE > subscription_end_date AND subscription_status = \'active\'';
        await client.query(updateQuery);
        logger.info(`Обновлен статус подписки для ${usersResult.rowCount} пользователей.`);
    } catch (error) {
        logger.error('Ошибка при обновлении статуса подписки:', error);
    } finally {
        await client.end();
    }
}







//runUserExist(123).then(result => console.log(result))
//addNewUser(123, 'ooopa', 'hopooa').then(result => console.log(result))
//let messages = [{role: "system", content : 'prompt' || 'expletive'}]
//addNewText(5208745478, ["hoy hoy"]).then(result => console.log(result))
//getText(5208745478).then(result => console.log(result))
//deleteGetText(194857311).then(result => console.log(result))
//addStatusOne(194857311, 'status').then(r => console.log(r))
//getStatusOne(5208745478, 'status').then(r => console.log(r))
//const id = await getIdUser(5208745478)
//console.log(id[0].id)