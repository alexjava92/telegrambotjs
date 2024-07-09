import {bot} from "../index.js";

export const handleVideo = async (msg) => {

    try {
        const fileId = msg.video_note.file_id;
        const fileLink = await bot.getFileLink(fileId);
        // Здесь вы можете обработать ссылку на видео, например, сохранить его на сервере или отправить другому пользователю
        console.log('Video link:', fileLink);
    } catch (error) {
        console.error('Error handling video:', error);
    }
}
