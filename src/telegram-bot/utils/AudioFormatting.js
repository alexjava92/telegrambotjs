import childProcess from 'child_process';
import ffmpegStatic from 'ffmpeg-static';


export const ffmpeg = (inputPath, outputPath, options = []) => {
    return new Promise((resolve, reject) => {
        const ffmpegProcess = childProcess.spawn(ffmpegStatic, [
            '-i', inputPath,
            ...options,
            outputPath
        ], {
            stdio: 'inherit'
        });

        ffmpegProcess.on('error', reject);
        ffmpegProcess.on('close', resolve);
    });
};