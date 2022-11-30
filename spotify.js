const axios = require("axios");
const os = require('node:os');
let tokens = null;
let clientToken = null;
let abortController = null;

module.exports = {
  searchSpotify,
  getArtistInfo,
  getAlbumInfo,
  addInfoArtistTracks,
};

refreshTokens();

async function refreshTokens() {
  const tokens = await getTokens();
  const clientId = await tokens.clientId;
  console.log(clientId);
  await getClientToken(clientId);
}


async function getTokens() {
  if (tokens == null || tokens.accessTokenExpiration < Date.now()) {
    response = await axios.get("https://open.spotify.com/get_access_token");
    console.log("refreshing tokens");
    tokens = {'clientId': response.data.clientId, 'accessToken': response.data.accessToken, 'accessTokenExpiration': response.data.accessTokenExpirationTimestampMs};
    return tokens
  }

  return tokens;
}

async function getClientToken(clientId) {
  if (clientToken == null || clientToken.expirationDate < Date.now()) {
    console.log("refreshing client token");
    response = await axios({
      method: 'post',
      url: 'https://clienttoken.spotify.com/v1/clienttoken',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/json' 
      },
      data: {
        "client_data": {
          "client_version":"SPITIFY_BETA",
          "client_id": clientId,
          "js_sdk_data":{"device_brand":"Apple","device_model":"desktop","os": os.platform(),"os_version": os.release()}
        }
      }
    })

    const expirationDate = Date.now() + 250000;
    const token = response.data.granted_token.token;

    clientToken = {
      'token': token,
      'expirationDate': expirationDate
    }

    return token;
  }
  
  return clientToken.token;
}

async function searchSpotify(query, mainWindow) {
  //start = new Date()
  console.log("searching spotify");

  if (abortController != null) {
    abortController.abort();
    console.log("aborting previous request");
  }
  const tokens = await getTokens();
  const accessToken = await tokens.accessToken;

  urlStart =
    "https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchDesktop&";
  variables =
    '{"searchTerm":"' +
    query +
    '","offset":0,"limit":5,"numberOfTopResults":5}';
  hash =
    '{"persistedQuery":{"version":1,"sha256Hash":"75bbf6bfcfdf85b8fc828417bfad92b7cd66bf7f556d85670f4da8292373ebec"}}';

  const controller = new AbortController();

  url = getEncodedURL(urlStart, variables, hash);
  axios.get(url, {
    headers: { authorization: "Bearer " + accessToken },
    signal: controller.signal
  }).then(function(response) {
    abortController = null;

    console.log(response.data);
  
    invokeSearchResultEvent(response.data, mainWindow);
  }).catch(function(error) {
    abortController = null;
    console.log(error);
  });
  
  abortController = controller;
}

function invokeSearchResultEvent(result, mainWindow) {
  mainWindow.webContents.send("searchSpotify:event", result);
}

async function getArtistInfo(artistID) {
  //start = new Date()
  const tokens = await getTokens();
  const accessToken = await tokens.accessToken;
  const clientId = await tokens.clientId;
  const clientToken = await getClientToken(clientId);

  const testURL =
    "https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&";
    const variables = '{"uri":"spotify:artist:' + artistID + '","locale":""}';
  const hash =
    '{"persistedQuery": {"version": 1, "sha256Hash": "4313f019bcd5f69b6bc338d19e123a60fab1da35a89a4ed924d7903f2816d15c"}}';

  const url = getEncodedURL(testURL, variables, hash);
  let response = await axios.get(url, {
    headers: { 
    authorization: "Bearer " + accessToken,
    'client-token': clientToken 
  },
  });
  //time = new Date() - start
  //console.log('Execution time2: %dms', time)
  return response.data;
}

async function getAlbumInfo(albumID) {
  const tokens = await getTokens();
  const accessToken = await tokens.accessToken;
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
  const tokens = await getTokens();
  const accessToken = await tokens.accessToken;
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
  url = 'https://spclient.wg.spotify.com/color-lyrics/v2/track/' + id +'/image/' + coverImage + '?format=json&vocalRemoval=false&market=from_token';

  url = 'https://spclient.wg.spotify.com/color-lyrics/v2/track/3yfqSUWxFvZELEM4PmlwIR/image/https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273dbb3dd82da45b7d7f31b1b42?format=json&vocalRemoval=false&market=from_token'

  const localTokens = await getTokens();
  const accessToken = localTokens.accessToken;
  const clientToken = await getClientToken(localTokens.clientId);

  let response = await axios.get(url, {
    headers: { 
      authorization: "Bearer " + accessToken,
      'client-token': clientToken
  },  
  });

  console.log(response);

}

getSongLyrics('3yfqSUWxFvZELEM4PmlwIR', 'https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273dbb3dd82da45b7d7f31b1b42');
//getClientToken();

function getEncodedURL(url, variables, hash) {
  const params = new URLSearchParams();
  params.append("variables", variables);
  params.append("extensions", hash);
  return url + params.toString();
}
