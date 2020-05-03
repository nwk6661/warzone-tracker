require('dotenv').config();
const {CommandoClient} = require('discord.js-commando');
const path = require('path');

const client = new CommandoClient({
    commandPrefix: process.env.PREFIX,
    owner: process.env.OWNER
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

client.login(process.env.CLIENT_TOKEN);
