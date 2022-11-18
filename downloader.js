const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ytcog = require("ytcog");
const { app } = require("electron");

module.exports = {
    downloadSongs
}

async function downloadSongs(songs, mainWindow) {

    const documentsPath = app.getPath("documents");
    const folderPath = path.join(documentsPath, "Spitify")
    const downloadPath = path.join(folderPath, "downloads");
    const locations = [];

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

    let session = new ytcog.Session();
    await session.fetch();

    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        const songName = song.songName;
        const songYoutubeId = song.youtubeId;
        const spotifyId = song.spotifyId;

        const video = new ytcog.Video(session, {
            id: songYoutubeId,
            filename : songName,
            path: downloadPath,
            videoQuality: 'none',
            audioQuality: 'highest',
            container: 'webm',
            progress: (prg, siz, tot)=> {
                updateDownloadProgress(prg, spotifyId, mainWindow);
            }
        });
        
        await video.download();

        const filePath = path.join(downloadPath, `${songName}.opus`);

        locations.push({
            id: spotifyId,
            filePath: filePath,
        })
    }

    return locations;
}

function updateDownloadProgress(progress, spotifyId, mainWindow) {
    mainWindow.webContents.send("update:downloads", progress, spotifyId);
}