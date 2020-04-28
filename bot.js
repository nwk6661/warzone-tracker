const {prefix, token, owner} = require("./config.json");
const {CommandoClient} = require('discord.js-commando');
const path = require('path');

const client = new CommandoClient({
    commandPrefix: prefix,
    owner: owner
});

client.registry.registerDefaultTypes()
      .registerDefaultGroups()
      .registerGroups([
          ['statistics', 'Commands for getting statistics']
      ])
      .registerDefaultGroups()
      .registerDefaultCommands()
      .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Jorge be bad', { type: "WATCHING" })
});

client.login(token);
