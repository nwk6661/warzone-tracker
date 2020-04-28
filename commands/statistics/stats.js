const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const common = require('../../common');
const axios = require('axios');

// we need to include our api key in all headers
// also might as well put the base URL :D
const instance = axios.create({
    baseURL: 'https://api.tracker.gg/api/v2/warzone/standard/profile/',
    //headers: {'TRN-Api-Key': '2aebdc5c-bf63-4d57-b931-4eca7dbdd40f'}
});

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            aliases: ['statistics'],
            group: 'statistics',
            memberName: 'stats',
            description: 'Get the statistics for a player',
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
                }
            ],
            throttling: {
                usages: 2,
                duration: 60
            },
        });
    }

    run(message, {platform, username}) {
        const userFormatted = encodeURIComponent(username);
        const slug = common.determinePlatform(platform);
        instance.get(`${slug}\/${userFormatted}`)
                .then(function (response) {
                        message.embed(parseStats(response));
                    }
                )
                .catch(function (err) {
                    message.say("Could not retrieve data from API.\n If you are sure the name is correct," +
                        " contact the dev");
                    console.error(err);
                });
    }

};

const parseStats = function (response) {
    let data = response.data['data'];
    const embed = new MessageEmbed();
    const platformInfo = data['platformInfo'];
    const fullName = platformInfo['platformUserHandle'];
    embed.setTitle(`Warzone stats for ${fullName}`);
    const avatar = platformInfo['avatarUrl'];
    embed.setThumbnail(avatar);
    const statsRoot = data['segments'][0]['stats'];
    embed.addFields(
        getFieldFromName('Kills', statsRoot),
        getFieldFromName('Deaths', statsRoot),
        getFieldFromName('KD Ratio', statsRoot, 'kdRatio'),
        getFieldFromName('Downs', statsRoot),
        getFieldFromName('Wins', statsRoot),
        getFieldFromName('Top 5', statsRoot, 'top5'),
        getFieldFromName('Top 10', statsRoot, 'top10'),
        getFieldFromName('Games Played', statsRoot, 'gamesPlayed')
    );
    embed.setFooter('Data from cod.tracker.gg/warzone/').setTimestamp();
    return embed;
};

const getFieldFromName = function(name, statisticsRoot, tag, isInline) {
    const nameLC = name.toLowerCase();
    tag = (typeof(tag) !== "undefined") ? tag : nameLC;
    isInline = (typeof(isInline) !== "undefined") ? isInline : true;
    return {name: name, value: common.getStatisticDisplay(statisticsRoot, tag), inline: isInline}
};
