const {Command} = require('discord.js-commando');
const common = require('../../common');
const axios = require('axios');
const dateFormat = require('date-fns');


// we need to include our api key in all headers
// also might as well put the base URL :D
const instance = axios.create({
    baseURL: 'https://api.tracker.gg/api/v2/warzone/matches/',
    //headers: {'TRN-Api-Key': '2aebdc5c-bf63-4d57-b931-4eca7dbdd40f'}
});

module.exports = class MatchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'game',
            aliases: ['match', 'squad'],
            group: 'statistics',
            memberName: 'game',
            description: 'Gets details for a certain squad in a certain match',
            args: [
                {
                    key: 'matchID',
                    prompt: 'What is the match ID?',
                    type: 'string',
                },
                {
                    key: 'username',
                    prompt: 'What is the username? (no #/numbers! as it appears in game)',
                    type: 'string',
                }
            ],
            throttling: {
                usages: 2,
                duration: 60
            },
        });
    }

    run(message, {matchID, username}) {
        instance.get(`${matchID}\/`)
                .then(function (response) {
                        let gameDetails = getMatchDetailsForName(response, username);
                        if (gameDetails.hasOwnProperty('error')) {
                            message.say(gameDetails['error']);
                            return;
                        }
                        let resultStr = '';
                        resultStr += `__**Squad results for ${gameDetails['date']}**__\n`;
                        resultStr += `Placement: ${gameDetails['placement']}\n`;
                        resultStr += `**--------------------------------**\n\n`;
                        for (const player of gameDetails['players']) {
                            resultStr += `**Name:** ${player['name']} \n`;
                            resultStr += `**Kills:** ${player['kills']} \n`;
                            resultStr += `**Damage:** ${player['damage']} \n`;
                            resultStr += `**Deaths:** ${player['deaths']} \n`;
                            resultStr += `**% Time Moving:** ${player['percentMoving']} \n`;
                            resultStr += "\n";
                        }
                        message.say(resultStr)
                    }
                )
                .catch(function (err) {
                    message.say("Could not retrieve data from API.\n If you are sure the name is correct," +
                        " contact the dev");
                    console.error(err);
                });
    }

};

const getMatchDetailsForName = function (response, username) {
    const result = {players: []};
    const data = response.data['data'];
    const date = new Date(data['metadata']['timestamp']);
    result['date'] = dateFormat.format(date, "MMMM do, yyyy hh:mm a");
    const playerListJson = data['segments'];
    let team;
    let fullName;
    // loop to find team
    for (const player of playerListJson) {
        if (player['attributes']['platformUserIdentifier'].toLowerCase() === username.toLowerCase()) {
            team = player['attributes']['team'];
            result['placement'] = common.getStatisticDisplay(player['metadata'], 'placement');
            fullName = player['attributes']['platformUserIdentifier'];

        }
    }
    // did we find the player
    if (!team) {
        result['error'] = "Could not find player " + username;
        return result;
    }
    // loop to get data
    for (const player of playerListJson) {
        // our team?
        if (player['attributes']['team'] === team) {
            result['players'].push(
                {
                    name: player['metadata']['platformUserHandle'],
                    kills: common.getStatisticDisplay(player['stats'], 'kills'),
                    damage: common.getStatisticDisplay(player['stats'], 'damageDone'),
                    deaths: common.getStatisticDisplay(player['stats'], 'deaths'),
                    percentMoving: common.getStatisticDisplay(player['stats'], 'percentTimeMoving'),
                }
            )
        }
    }
    return result;
};
