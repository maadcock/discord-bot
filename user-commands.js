exports.help = function help(prefix,msg,botUID) {
    let newMsg = "";
    if (msg.content.startsWith(`<@${botUID}>`)) { // Allows the user to ping the bot directly, in which case the bot will return the current prefix for command use
        newMsg = `The prefix is currently set to \`${prefix}\`\n`;
    }
    newMsg += `\`\`\`diff\nProfile Command List\n`;
    newMsg += `${prefix}createprofile - Creates a profile on the bot\n`;
    newMsg += `${prefix}deleteprofile - Deletes your profile from the database\n`;
    newMsg += `${prefix}profile - Returns your profile\n`;
    newMsg += `${prefix}whoami - Returns your profile\n`;
    newMsg += `${prefix}whois <user> - Returns the users profile\n`;
    newMsg += `${prefix}profile add <twitch|twitter|facebook|instagram> - Adds Twitch|Twitter|Facebook|Instagram links to your profile\n`;
    newMsg += `${prefix}profile del <twitch|twitter|facebook|instagram> - Removes Twitch|Twitter|Facebook|Instagram links to your profile\n`;
    newMsg += `\n\n`;
    newMsg += `Random Command List\n`;
    newMsg += `${prefix}catfact - Returns a random fact about cats\n`;
    newMsg += `${prefix}catfact <number> - Returns the specificed cat fact\n`;
    newMsg += `\n\n`;
    newMsg += `Twitch/Mixer Command List\n`;
    newMsg += `${prefix}live <username> - Returns if Twitch user indicated is currently live\n`;
    newMsg += `${prefix}stats <username> - Returns Twitch stats of selected user\n`;
    newMsg += `${prefix}mixerstats <username> - Returns the Mixer stats of the selected user\n`;
    newMsg += `\n\n`;
    newMsg += `Bot Commands\n`
    newMsg += `${prefix}help - Returns a list of bot commands\n`;
    newMsg += `\n\n`;
    newMsg += `Admin Commands\n`;
    newMsg += `${prefix}prefix - Changes the prefix for the bot in the server\n`;
    newMsg += `${prefix}timeout - Sends a user to designated timeout role\n`;
    newMsg += `${prefix}timeout setrole <role> - Designates a timeout role\n`;
    newMsg += `${prefix}timeoutlist - Lists currently timed out users\n\`\`\``;
    msg.channel.send(newMsg);
}