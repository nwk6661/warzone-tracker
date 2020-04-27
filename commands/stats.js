const common = require('./common');
const {prefix} = require('../config');
const axios = require('axios');
const Discord = require("discord.js");

// we need to include our api key in all headers
// also might as well put the base URL :D
const instance = axios.create({
    baseURL: 'https://api.tracker.gg/api/v2/warzone/standard/profile/',
    //headers: {'TRN-Api-Key': '2aebdc5c-bf63-4d57-b931-4eca7dbdd40f'}
});

module.exports = {
    name: 'stats',
    description: 'Gets the stats for a player. Platforms are activision, battle.net, psn, xbl',
    aliases: ['statistics'],
    usage: '[platform] [name]',
    cooldown: 5,
    args: true,
    execute(message, args) {
        if (args.length !== 2) {
            message.channel.send(`Invalid arguments, correct usage should be \'${prefix}${this.name} ${this.usage}\'`)
            return;
        }
        const platformName = args[0].toLowerCase();
        const slug = common.determinePlatform(platformName);
        const username = encodeURIComponent(args[1]);
        instance.get(`${slug}\/${username}`)
            .then(function (response) {
                    message.channel.send(parseStats(response));
                }
            )
            .catch(function (err) {
                message.channel.send("Could not find player data.\n If you are sure the name is correct," +
                    " contact the dev");
                console.error(err);
            });
    }
};


const parseStats = function (response) {
    let data = response.data['data'];
    const embed = new Discord.MessageEmbed();
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
    return {name: name, value: getStat(statisticsRoot, tag), inline: isInline}
};

const getStat = function(statisticsRoot, tag) {
    return statisticsRoot[tag]['value'];
};
