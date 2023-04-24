const API_GATEWAY_HOST = 'https://9imwtyca2i.execute-api.ap-southeast-2.amazonaws.com/Prod/';
const army_endpoint = 'army/';
const factions_endpoint = 'factions';
const fireteams_endpoint = 'fireteams';

async function getFactionList() {
    const url = API_GATEWAY_HOST + factions_endpoint;
    return executeGetRequest(url);
}

async function getFireteamsList() {
    const url = API_GATEWAY_HOST + fireteams_endpoint;
    return executeGetRequest(url);
}

async function getArmyData(armyId) {
    const url = API_GATEWAY_HOST + army_endpoint + armyId;
    return executeGetRequest(url);
}

async function executeGetRequest(url) {
    return new Promise(function (resolve, reject) {
        const options = {
            type: 'GET',
            url: url,
        }
        $.ajax(options).done(resolve).fail(reject);
    });
}