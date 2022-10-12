const axios = require("axios");

module.exports = {
  searchSpotify,
  getArtistInfo,
  getAlbumInfo,
  addInfoArtistTracks,
};

async function getAccessToken() {
  response = await axios.get("https://open.spotify.com/get_access_token");
  return response.data["accessToken"];
}

async function getClientToken() {
  response = await axios.get("https://clienttoken.spotify.com/v1/clienttoken", 
  {
    headers: {
      Accept: 'application/json',
    }
  });
  console.log(response);
}

async function searchSpotify(query) {
  //start = new Date()
  accessToken = await getAccessToken();
  urlStart =
    "https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchDesktop&";
  variables =
    '{"searchTerm":"' +
    query +
    '","offset":0,"limit":5,"numberOfTopResults":5}';
  hash =
    '{"persistedQuery":{"version":1,"sha256Hash":"75bbf6bfcfdf85b8fc828417bfad92b7cd66bf7f556d85670f4da8292373ebec"}}';

  url = getEncodedURL(urlStart, variables, hash);
  response = await axios.get(url, {
    headers: { authorization: "Bearer " + accessToken },
  });
  //time = new Date() - start
  //console.log('Execution time1: %dms', time)
  return response.data;
}

async function getArtistInfo(artistID) {
  //start = new Date()
  getClientToken();
  const accessToken = await getAccessToken();
  const testURL =
    "https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&";
    const variables = '{"uri":"spotify:artist:' + artistID + '"}';
  const hash =
    '{"persistedQuery": {"version": 1, "sha256Hash": "d66221ea13998b2f81883c5187d174c8646e4041d67f5b1e103bc262d447e3a0"}}';

  const url = getEncodedURL(testURL, variables, hash);
  let response = await axios.get(url, {
    headers: { authorization: "Bearer " + accessToken },
  });
  //time = new Date() - start
  //console.log('Execution time2: %dms', time)
  return response.data;
}

async function getAlbumInfo(albumID) {
  const accessToken = await getAccessToken();
  const urlStart =
    "https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryAlbumTracks&";
  const variables = '{"uri":"spotify:album:' + albumID + '", "offset":0,"limit":300}';
  const hash =
    '{"persistedQuery": {"version": 1, "sha256Hash": "3ea563e1d68f486d8df30f69de9dcedae74c77e684b889ba7408c589d30f7f2e"}}';

  const url = getEncodedURL(urlStart, variables, hash);
  let response = await axios.get(url, {
    headers: { authorization: "Bearer " + accessToken },
  });
  return response.data;
}

async function addInfoArtistTracks(songIds) {
  const accessToken = await getAccessToken();
  const url = 'https://api-partner.spotify.com/pathfinder/v1/query?operationName=decorateContextTracks&';
  
  spotifyURIs = songIds.map((id) => 'spotify:track:' + id);
  const variables = '{"uris":' + JSON.stringify(spotifyURIs) + '}';
  const hash = '{"persistedQuery":{"version":1,"sha256Hash":"d4e07a4541bb7594ce30a2eeaaf35a2d78733ef59d0f5c88bdf3dcc2579dc0b6"}}';

  const encodedUrl = getEncodedURL(url, variables, hash);

  let response = await axios.get(encodedUrl, {
    headers: { authorization: "Bearer " + accessToken },
  });

  return response.data;
}

async function getSongLyrics(id, coverImage) {
  const url = 'https://spclient.wg.spotify.com/color-lyrics/v2/track/' + id +'/image/' + coverImage + '?format=json&vocalRemoval=false&market=from_token';

  const accessToken = await getAccessToken();

  const clientToken = 'AACs6lv5IZUL62eq/qPcNcSi6r24yrzjqfZDXPIHX8zdTpds6/zIL+8cNpVgA/tKsTQTOud8YTIsksKDX6CAHjLs0Gygbrv2pBLGwND+RJCViJHmwLCBUCEoPtbWtHnMDa7Z+owHB9sw5x6dUi2DS2YPMC3Jt1NMw+C6haQ0uEEbi8iFvc2Uurw2Yl8r0XFWDa2V+3sai/85sGYqblc63be0VONhMCNR1zE0edlbKIvIzWPxExx0qU72y/NhjKjY3QpPZTdOlwZchmKkTi4WTha5Hgiax7pIw/mIbQ==';


  console.log(url);
  console.log(accessToken);

  let response = await axios.get(url, {
    headers: { 
      authorization: "Bearer " + accessToken,
      'client-token': clientToken
  },  
  });

  console.log(response);

}

//getSongLyrics('3yfqSUWxFvZELEM4PmlwIR', 'https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273dbb3dd82da45b7d7f31b1b42');
//getClientToken();

function getEncodedURL(url, variables, hash) {
  const params = new URLSearchParams();
  params.append("variables", variables);
  params.append("extensions", hash);
  return url + params.toString();
}
