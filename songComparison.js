const levenshtein = require("js-levenshtein");

module.exports = {
    chooseCorrectSong,
    checkIfUrlExpired
}

async function chooseCorrectSong(apiResponse, info) {
    //updated for every song in youtube if song is closer to spotify song
    let closestMatchDeviation;
    let closestMatch;
    let searchResults = [];

    for (let i = 0; i < apiResponse.length; i++) {
      const song = apiResponse[i];
      /*
      comparisons (not ordered by importance):
        1. artists
        2. title
        3. album
        4. duration
        5. content rating
        6. ytResultPriority
      */

      //compare the artists (result is nr of found artists and a title that does not include featured artists)
      const spotifyArtists = info.artists.items;
      const resultArtistComparison = await compareArtists(
        spotifyArtists,
        song.artists,
        song.title
      );

      const foundArtists = resultArtistComparison.nrFound;
      const artistNumberDeviation = Math.abs(
        resultArtistComparison.nrFound - spotifyArtists.length
      );
      const newTitle = resultArtistComparison.newTitle;

      //compare titles (result#is deviation as Levenshtein distance)
      const normalTitleComparison = await compareTitles(
        info.name,
        song.title 
      );

      const similarTitleComparison = await titleSimilarity(
        info.name,
        song.title
      );

      console.log(similarTitleComparison);

      const reducedTitleComparison = await compareTitles(
        info.name,
        newTitle 
      );

      const bracketLess = getBracketlessTitle(newTitle);
      let bracketLessComparison = 0;
      let resultTitleComparison = 0;


      //this section of the code tries to work around issues with backets in the title - it tries to 
      //extract the title without the brackets and compares it to the spotify title
      if (!bracketLess) {
        resultTitleComparison = Math.min(normalTitleComparison, reducedTitleComparison);

      } else {

        if (bracketLess.cleanText == bracketLess.extractedText) {
          bracketLessComparison = await compareTitles(
            info.name,
            bracketLess.cleanText
          );

          resultTitleComparison = Math.min(normalTitleComparison, reducedTitleComparison, bracketLessComparison);

        } else if (info.songAlbum != undefined && bracketLess.extractedText.includes(info.songAlbum.name)) {
          bracketLessComparison = await compareTitles(
            info.name,
            bracketLess.cleanText
          );
  
          resultTitleComparison = Math.min(normalTitleComparison, reducedTitleComparison, bracketLessComparison);
        } else {
          resultTitleComparison = Math.min(normalTitleComparison, reducedTitleComparison);

        }
      }

      //check if one title includes the other
      const titleOverlap = findTitleOverlap(info.name, song.title);


      //compare album titles (if song has album) (result is deviation as Levenshtein distance)
      let resultAlbumComparison;
      if (song.album != undefined && info.songAlbum != undefined) {
        resultAlbumComparison = await albumTitleComparison(
          info.album.name,
          song.album
        );
      }

      //compare duration (result is deviation in seconds)
      const totalSeconds = info.duration.totalMilliseconds / 1000;

      const timeDifference = compareSongDurations(
        totalSeconds,
        song.duration.totalSeconds
      );

      //compare content rating (result is bool if matches)
      const resultContentRatingMatch = compareContentRatings(
        info.contentRating.label,
        song.isExplicit
      );

      var artistsContainNonLatinChars = artistsContainNonLatinCharacters(spotifyArtists, song.artists);

      //if content rating is not the same, the songs cant match
      if (resultContentRatingMatch == false || foundArtists == 0 && song.artists != 0 && !artistsContainNonLatinChars) {
        console.log("song does not match search criteria");
        continue;
      }

      //check if the songs are a perfect match
      if (
        resultTitleComparison == 0 &&
        resultContentRatingMatch == true &&
        artistNumberDeviation == 0
      ) {
        //song is a perfect match
        return song;
      }

      //check if the song is a better match than the current closest match
      let songDeviation =
        i * i +
        artistNumberDeviation * 6 +
        similarTitleComparison +
        resultTitleComparison * 1.5 +
        resultAlbumComparison * 1.3 +
        timeDifference * 0.5;

      if (titleOverlap) {
        songDeviation = songDeviation * 0.5;
      }

      searchResults.push({
        title: info.name,
        ytTitle: song.title,
        artistNumberDeviation: artistNumberDeviation,
        similarTitleComparison: similarTitleComparison,
        resultTitleComparison: resultTitleComparison,
        titleOverlap: titleOverlap,
        resultAlbumComparison: resultAlbumComparison,
        timeDifference: timeDifference,
        deviation: songDeviation
      })

      if (
        closestMatchDeviation == undefined ||
        songDeviation < closestMatchDeviation
      ) {
        closestMatchDeviation = songDeviation;
        closestMatch = song;
      }
    }

    console.table(searchResults);

    return apiResponse[0];
  }

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

function findTitleOverlap(spotifyTitle, ytTitle) {
    if (spotifyTitle.includes(ytTitle)) {
        return true;
    }

    if (ytTitle.includes(spotifyTitle)) {
        return true;
    }
        
    return false;
}

function removeBrackets(string) {
    return string
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll("{", "")
    .replaceAll("}", "")
    .replaceAll("[", "")
    .replaceAll("]", "");
}

function titleSimilarity(spotifyTitle, ytTitle) {
    //divide spotifyTitle into words 
    const spotifyTitleWords = spotifyTitle.split(" ");

    //remove words from ytTitle that are also in spotifyTitle

    let newTitle = ytTitle;

    remainingWordsLength = 0;

    for (let i = 0; i < spotifyTitleWords.length; i++) {
        const word = spotifyTitleWords[i];
        tempWord = removeBrackets(word).trim();
        search = newTitle.search(tempWord);

        if (search > -1) {
            newTitle = newTitle.replace(tempWord, "");
        } else {
            remainingWordsLength += tempWord.length;
        }
    }

    newTitle = newTitle.replaceAll(/\s/g,'')
    newTitleLength = newTitle.length;

    return newTitleLength + remainingWordsLength;; 
}

async function getLevenshteinDistance(s1, s2) {
    return await levenshtein(s1, s2);
}

function checkIfUrlExpired(url) {
  const expired = new URL(url).searchParams.get("expire");
  const timeDelta = expired - Math.floor(Date.now() / 1000);
  return timeDelta < 0;
}
