const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const common = require('../../common');
const axios = require('axios');
const dateFormat = require('date-fns');

// we need to include our api key in all headers
// also might as well put the base URL :D
const instance = axios.create({
    baseURL: 'https://api.tracker.gg/api/v2/warzone/matches/',
    //headers: {'TRN-Api-Key': '2aebdc5c-bf63-4d57-b931-4eca7dbdd40f'}
});

module.exports = class GamesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'games',
            aliases: ['matches', 'recent'],
            group: 'statistics',
            memberName: 'games',
            description: 'Gets 5 most recent games for a player',
            args: [
                {
                    key: 'platform',
                    prompt: 'What is the platform?',
                    type: 'string',
                    validate: text => common.determinePlatform(text) != null,
                },
                {
                    key: 'username',
                    prompt: 'What is the username?',
                    type: 'string',
                },
                {
                    key: 'amount',
                    prompt: 'How many games do you want to fetch?',
                    type: 'integer',
                    default: 5
                }
            ],
            throttling: {
                usages: 2,
                duration: 60
            },
        });
    }

    run(message, {platform, username, amount}) {
        const slug = common.determinePlatform(platform);
        const usernameFormatted = encodeURIComponent(username);
        instance.get(`${slug}\/${usernameFormatted}`)
                .then(function (response) {
                        let recentGamesEmbed = getRecentGames(response, amount);
                        recentGamesEmbed.setTitle(`Recent matches for ${username}`);
                        message.embed(recentGamesEmbed);
                    }
                )
                .catch(function (err) {
                    message.say("Could not retrieve data from API.\n If you are sure the name is correct," +
                        " contact the dev");
                    console.error(err);
                });
    }

};

const getRecentGames = function (response, amount) {
    let data = response.data['data'];
    const embed = new MessageEmbed();
    embed.setDescription("5 most recent matches are below");
    const results = getMatches(data['matches'], amount);
    for (const res of results['matches']) {
        const valString =
            `Placement: ${res['placement']}` + "\n" +
            `Kills: ${res['kills']}` + "\n" +
            `Damage: ${res['damage']}` + "\n" +
            `Match ID: ${res['id']}` + "\n";
        embed.addField( res['date'], valString)
    }
    embed.setFooter('Data from cod.tracker.gg/warzone/').setTimestamp();
    return embed;
};

const getMatches = function(matchesRoot, amount) {
    const results = {matches: []};
    // get 5 matches
    for (const match of matchesRoot.slice(0, amount)) {
        const matchID = match['attributes']['id'];
        const date = new Date(match['metadata']['timestamp']);
        const newDate = dateFormat.format(date, "MMMM do, yyyy hh:mm a");
        const details = match['segments'][0]['stats'];
        const placement = common.getStatisticDisplay(details, 'placement');
        const kills = common.getStatisticDisplay(details, 'kills');
        const damage = common.getStatisticDisplay(details, 'damageDone');
        results['matches'].push(
            {
                id: matchID,
                date: newDate,
                placement: placement,
                kills: kills,
                damage: damage
            }
        )
    }
    return results;
};
