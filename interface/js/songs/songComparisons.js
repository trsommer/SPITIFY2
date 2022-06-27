async function compareArtists(spotifyArtists, ytArtists, songTitle) {
    let nrFound = 0;
    let newTitle = songTitle;

    

    for (let i = 0; i < spotifyArtists.length; i++) {
        const spotifyArtist = spotifyArtists[i];
        let found = false;
        for (let j = 0; j < ytArtists.length; j++) {
            const ytArtist = ytArtists[j];
            //check if artists name matches
            if (spotifyArtist.profile.name == ytArtist.name) {
                nrFound++;
                found = true;
            }
        }

        //check if the title containes featured artists
        if(!found && songTitle.includes(spotifyArtist)) {
            nrFound++;
            newTitle.replace(spotifyArtist, "");
        }
    }

    returnObject = { nrFound: nrFound, newTitle: newTitle };

    return returnObject;
}

async function compareTitles(spotifyTitle, ytTitle) {
    //just a comparison of the Levenshtein distance for now
    const distance =  await getLevenshteinDistance(spotifyTitle, ytTitle);

    return distance;
}   

async function albumTitleComparison(spotifyAlbumTitle, ytAlbumTitle) {
    //just a comparison of the Levenshtein distance for now
    const distance =  await getLevenshteinDistance(spotifyAlbumTitle, ytAlbumTitle);

    return distance;
}

function compareSongDurations(spotifyDuration, ytDuration) {
    spotifySeconds = Math.floor(spotifyDuration / 1000);
    
    //get absolute difference between spotify and youtube duration
    const difference = Math.abs(spotifySeconds - ytDuration);

    return difference;
}

function compareContentRatings(spotifyContentRating, ytContentRating) {
    if (spotifyContentRating == "EXPLICIT") {
        if (ytContentRating) {
            return true;
        }
        return false;
    }

    if (spotifyContentRating == "NONE") {
        if (!ytContentRating) {
            return true;
        }
        return false;
    }
}