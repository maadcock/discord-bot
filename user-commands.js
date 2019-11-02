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

exports.mixer = function mixer(msg,mixerClientID,mixerClient) {
    let msgContent = msg.content.split(" ")[1]
    const channelName = msgContent

    mixerClient.use(new Mixer.OAuthProvider(client, {
        clientId: mixerClientID,
    }))

    mixerClient.request('GET', `channels/${channelName}`)
    .then(res => {
        const channel = res.body
        const chName = channel.user.username
        const chViewers = channel.viewersTotal
        const chFollowers = channel.numFollowers
        res.body.partnered === true ? chStatus = 'Partner' : chStatus = 'Broadcaster'
        // console.log(res.body)

        msg.channel.send(`\`\`\`css\n${chName}\nFollowers: ${chFollowers}\nChannel Views: ${chViewers}\nBroadcaster Status: ${chStatus}\`\`\``)
    })
}

exports.catFacts = function catFacts(msg,XMLHttpRequest) {
    function httpGet(){
        let url = 'https://cat-fact.herokuapp.com/facts'
        let xmlHttp = new XMLHttpRequest()
        xmlHttp.open( "GET", url, false)
        xmlHttp.send(null)
        return xmlHttp.responseText
    }
    let catFacts = JSON.parse(httpGet())
    let catFactCount = catFacts.all.length
    let msgContent = msg.content.split(" ")[1]

    if (msgContent == undefined) {
        let factNumber = Math.floor(Math.random() * catFactCount)
        let catFactObject = catFacts.all[factNumber]
        let fact = catFactObject.text
        let authorFirstName = catFactObject.user.name.first
        let authorLastName = catFactObject.user.name.last
        msg.channel.send(`Cat Fact #${factNumber}: ${fact} - ${authorFirstName} ${authorLastName}`)
    } else {
        msgContent = parseInt(msgContent, 10)
        if (msgContent > 0) {
            let factNumber = msgContent
            let catFactObject = catFacts.all[factNumber]
            let fact = catFactObject.text
            let authorFirstName = catFactObject.user.name.first
            let authorLastName = catFactObject.user.name.last
            msg.channel.send(`Cat Fact #${factNumber}: ${fact} - ${authorFirstName} ${authorLastName}`)
        } else {
            msg.channel.send(`Use a number between 1 and ${catFactCount}. For example \`${prefix}catfacts 100\``)
        }
    }

}