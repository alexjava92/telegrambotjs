export const handlePDF = async (msg, bot) => {
    try {
        const fileId = msg.document.file_id;
        const fileLink = await bot.getFileLink(fileId);
        // Здесь вы можете обработать ссылку на PDF-файл, например, сохранить его на сервере или отправить другому пользователю
        console.log('PDF link:', fileLink);
    } catch (error) {
        console.error('Error handling PDF:', error);
    }
}