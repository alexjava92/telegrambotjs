import {
    addNewText,
    addNewUser,
    addStatus,
    addStatusOne,
    deleteGetText, getBalance, getPaymentAmount,
    getResponseCount,
    getStatus,
    getStatusOne,
    getText,
    getUserFromDB,
    incrementResponseCount,
    resetResponseCount, savePaymentAmount, savePaymentInfo, setBalance,
    setResponseCount,
    setSubscriptionActive,
    setSubscriptionEndDate,
    updateUserNameAndFirstName
} from "../database/database.js";
import {logger} from "../logger/logger.js";

export class User {
    constructor(userData) {
        this.id = userData.id;
        this.chatId = userData.chatId;
        this.username = userData.username;
        this.firstName = userData.firstName;
        this.messageHistory = userData.messageText;
        this.subscriptionStatus = userData.subscriptionStatus;
        this.status = userData.status;
        this.status1 = userData.status1;
        this.responseCount = userData.responseCount;
        this.lastResponseDate = userData.lastResponseDate;
        this.subscriptionEndDate = userData.subscriptionEndDate;
        this.paymentInfo = userData.paymentInfo;
        this.balance = userData.balance;
    }

    static async getUser(chatId) {
        const userDataFromDB = await getUserFromDB(chatId);
        return userDataFromDB ? new User(userDataFromDB) : null;
    }

    static async createUser(chatId, username, firstName) {
        const result = await addNewUser(chatId, username, firstName);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    static async updateUserDetails(chatId, username, firstName) {
        const result = await updateUserNameAndFirstName(chatId, username, firstName);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async addUserText(userText) {
        const result = await addNewText(this.chatId, userText);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async getUserText() {
        const result = await getText(this.chatId);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async deleteUserText() {
        const result = await deleteGetText(this.chatId);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async getUserName() {
        const result = await deleteGetText(this.chatId);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }


    async setUserStatus(status) {
        logger.info('setUserStatus запустился')
        const result = await addStatus(this.chatId, status);
        // Можно дополнительно обработать результат или вернуть его
        logger.info('result', result)
        return result;
    }

    async getUserStatus() {
        const result = await getStatus(this.chatId);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async setUserStatusOne(status) {
        const result = await addStatusOne(this.chatId, status);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async getUserStatusOne() {
        const result = await getStatusOne(this.chatId);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async resetResponseCount() {
        await resetResponseCount(this.chatId);
    }

    async incrementResponseCount() {
        await incrementResponseCount(this.chatId);
    }

    async getResponseCount() {
        const count = await getResponseCount(this.chatId);
        // Можно дополнительно обработать результат или вернуть его
        return count;
    }

    async setResponseCount(newCount) {
        await setResponseCount(this.chatId, newCount);
    }

    async setSubscriptionActive() {
        await setSubscriptionActive(this.chatId);
    }

    async setSubscriptionEndDate() {
        await setSubscriptionEndDate(this.chatId);
    }

    async savePaymentInfo(paymentInfo) {
        const result = await savePaymentInfo(this.chatId, paymentInfo);
        // Можно дополнительно обработать результат или вернуть его
        return result;
    }

    async setPaymentAmount(amount) {
        // Сохраните amount в базе данных или контексте пользователя
        // Например, используя функцию из вашей базы данных
        await savePaymentAmount(this.chatId, amount);
    }

    async getPaymentAmount() {
        // Получите amount из базы данных или контекста пользователя
        // Например, используя функцию из вашей базы данных
        const amount = await getPaymentAmount(this.chatId);
        return amount;
    }

    async setBalance(balance) {
        const result = await setBalance(this.chatId, balance);
        return result;
    }

    async getBalance() {
        const balance = await getBalance(this.chatId);
        return balance;
    }

}