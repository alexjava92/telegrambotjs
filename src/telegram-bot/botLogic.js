import {bot} from "./index.js";
import {addNewUser} from "../database/database.js";
import {runUserExist} from "../database/database.js";


const ADMIN = 194857311;

//Проверка есть ли пользователь в БД

export const exist = async (chatid, username, firstName) => {


    runUserExist(chatid)
        .then(async result => {
                console.log(result)
                if (result === 'Пользователь существует') {
                    console.log('Пользователь уже существует в БД')
                } else if (result === 'Пользователья не существует') {
                    await addNewUser(chatid, username, firstName)
                    console.log('Новый пользователь добавлен в БД')
                    await bot.sendMessage(ADMIN, 'Новый пользователь добавлен в БД')

                }
            }
        )

}