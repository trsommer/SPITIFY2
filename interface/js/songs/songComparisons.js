async function compareArtists(spotifyArtists, ytArtists, songTitle) {
    let nrFound = 0;
    let newTitle = songTitle;
    let nrArtistsFoundInTitle = 0;
    let artistsFoundInTitle = [];


    for (let i = 0; i < spotifyArtists.length; i++) {
        const spotifyArtist = spotifyArtists[i];
        const spotifyArtistNameUppercase = spotifyArtist.profile.name;
        const spotifyArtistNameLowercase = spotifyArtistNameUppercase.toLowerCase();

        let found = false;
        for (let j = 0; j < ytArtists.length; j++) {
            const ytArtist = ytArtists[j];
            //check if artists name matches

            const ytArtistName = ytArtist.name.toLowerCase();

            if (spotifyArtistNameLowercase.includes(ytArtistName) || ytArtistName.includes(spotifyArtistNameLowercase)) {
                nrFound++;
                found = true;
            }
        }

        //check if the title containes featured artists

        if(!found && songTitle.includes(spotifyArtistNameUppercase)) {
            nrFound++;
            artistsFoundInTitle.push(spotifyArtistNameUppercase);
            newTitle = newTitle.replace(spotifyArtistNameUppercase, "");
        }
    }

    if (artistsFoundInTitle.length > 0) {
        artistName = artistsFoundInTitle[0];
        if (!isBracketed(artistName, songTitle)) {
            return { nrFound: nrFound, newTitle: newTitle };
        } else {
            cleanTitle = getBracketlessTitle(newTitle);

            return { nrFound: nrFound, newTitle: cleanTitle.cleanText };

        }
    }

    return { nrFound: nrFound, newTitle: newTitle };
}

async function compareTitles(spotifyTitle, ytTitle) {
    //just a comparison of the Levenshtein distance for now
    const distance =  await getLevenshteinDistance(spotifyTitle.toLowerCase(), ytTitle.toLowerCase());

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

//method that checks if a string contains any kind of opening and closing bracket

function containsBrackets(string) {
    if (string.includes("(") && string.includes(")")) {
        return ['(', ')'];
    }
    if (string.includes("{") && string.includes("}")) {
        return ['{', '}'];
    }
    if (string.includes("[") && string.includes("]")) {
        return ['[', ']'];
    }

    return false;
}

function getBracketlessTitle(oldTitle) {
    brackets = containsBrackets(oldTitle);
    let extractedText = "";
    let cleanText = oldTitle;

    if (!brackets) {
        return false;
    }

    //   \[(.*?)\]^

    const regString = '\\' + brackets[0] + "(.*?)\\" + brackets[1];
    const regex = new RegExp(regString);
    const found = oldTitle.match(regex);

    if (found) {
        extractedText = found[1];
        cleanText = oldTitle.replace(found[0], "").trim();
    }

    return { 
        extractedText: extractedText, 
        cleanText: cleanText 
    };

}

//check if part of string is surrounded by brackets in original string

function isBracketed(string, originalString) {
    let brackets = containsBrackets(originalString);

    if (!brackets) {
        return false;
    }

    const regString = '\\' + brackets[0] + "(.*?)" + string + "(.*?)\\" + brackets[1];
    const regex = new RegExp(regString);
    const found = originalString.match(regex);

    if (found) {
        return true;
    }

    return false;
}

function containsNonLatinCodepoints(s) {
    return /[^\u0000-\u00ff]/.test(s);
}

function artistsContainNonLatinCharacters(spotifyArtists, ytArtists) {
    
    for (let i = 0; i < spotifyArtists.length; i++) {
        const artist = spotifyArtists[i];
        if (containsNonLatinCodepoints(artist.profile.name)) {
            return true;
        }
    }

    for (let i = 0; i < ytArtists.length; i++) {
        const artist = ytArtists[i];
        if (containsNonLatinCodepoints(artist.name)) {
            return true;
        }
    }

    return false;
}