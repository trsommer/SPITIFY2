const axios = require("axios");

module.exports = {
  searchSpotify,
  getArtistInfo,
  getAlbumInfo,
};

async function getAccessToken() {
  response = await axios.get("https://open.spotify.com/get_access_token");
  return response.data["accessToken"];
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
  accessToken = await getAccessToken();
  testURL =
    "https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&";
  variables = '{"uri":"spotify:artist:' + artistID + '"}';
  hash =
    '{"persistedQuery": {"version": 1, "sha256Hash": "d66221ea13998b2f81883c5187d174c8646e4041d67f5b1e103bc262d447e3a0"}}';

  url = getEncodedURL(testURL, variables, hash);
  response = await axios.get(url, {
    headers: { authorization: "Bearer " + accessToken },
  });
  //time = new Date() - start
  //console.log('Execution time2: %dms', time)
  return response.data;
}

async function getAlbumInfo(albumID) {
  accessToken = await getAccessToken();
  urlStart =
    "https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryAlbumTracks&";
  variables = '{"uri":"spotify:album:' + albumID + '", "offset":0,"limit":300}';
  hash =
    '{"persistedQuery": {"version": 1, "sha256Hash": "3ea563e1d68f486d8df30f69de9dcedae74c77e684b889ba7408c589d30f7f2e"}}';

  url = getEncodedURL(urlStart, variables, hash);
  response = await axios.get(url, {
    headers: { authorization: "Bearer " + accessToken },
  });
  return response.data;
}

function getEncodedURL(url, variables, hash) {
  const params = new URLSearchParams();
  params.append("variables", variables);
  params.append("extensions", hash);
  return url + params.toString();
}
