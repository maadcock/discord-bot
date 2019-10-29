// Variables
const Discord = require('discord.js');
const client = new Discord.Client();
const Mixer = require('@mixer/client-node');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const v5Accept = "application/vnd.twitchtv.v5+json";
const mixerClient = new Mixer.Client(new Mixer.DefaultRequestRunner());
const MongoClient = require('mongodb').MongoClient;

// Auth
const auth = require('./auth.json');
const clientID = auth.clientID;
const UIDAdmin = auth.adminUID;
const botUID = auth.botUID;
const twitchUser = auth.twitchUser;
const mixerClientID = auth.mixerClient;
const mongoUrl = auth.mongoUrl;

let prefix = '~'; // Set default prefix

// Sleep Function
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

// Discord Bot Login
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('maadha.us', { type: 'PLAYING' });
});

// MongoDB Connection
MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    const dbo = db.db("maadhaus-dev");
    const colUsers = dbo.collection("users");
    const colServers = dbo.collection("servers");


// Pull Prefixes for servers in db
    function loadPrefixes() {
        colServers.find().toArray(function(err, result) {
            if (result.length > 0) {
                dbServers = result;
            }
        });
    };

    // Load Users from Db
    function loadUsers() {
        colUsers.find().toArray(function(err, result) {
            if (result.length > 0) {
                dbUsers = result;
            }
        });
    };

    loadPrefixes();
    loadUsers();

// On Message Commands
client.on('message', msg => {

    for (var i = 0; i < dbServers.length; i++) {
        if (dbServers[i]._id == msg.guild.id) {
            prefix = dbServers[i].prefix;
        }
    }

    // Admin Commands

    // Server Count
    function serverCount() {
        msg.channel.send('I am currently present in ' + dbServers.length + ' servers.');
    }

    if (msg.content.startsWith('<@494323715215982592> How many servers are using you?') && msg.author.id == UIDAdmin) {
        serverCount();
    }

    if (msg.content.startsWith(prefix + 'servercount') && msg.author.id == UIDAdmin) {
        serverCount();
    }

    // Shutdown
    if (msg.content.startsWith(prefix + 'shutdown') && msg.author.id == UIDAdmin) {
        msg.channel.send('My battery is low and it’s getting dark. Goodbye.');
        client.destroy();
    } else if (msg.content.startsWith(prefix + 'shutdown') && msg.author.id != UIDAdmin) {
        msg.channel.send('Access denied.');
    }
    
    // Now Playing
    if (msg.content.startsWith(prefix + 'np') && msg.author.id == UIDAdmin) {
        console.log(prefix + 'np run by ' + msg.author.username);
        if (msg.content.split(" ")[1] == undefined) {
            msg.channel.send('ERROR: Please include an activity name. For example: `' + prefix + 'np A Good Movie`');
        } else {
            stringLen = msg.content.split(" ").length;
            var newActivity = "";
            for (var i = 1; i < msg.content.split(" ").length; i++) {
                newActivity = newActivity + msg.content.split(" ")[i] + " ";
            }
            client.user.setActivity(newActivity, { type: 'PLAYING' });
        }
    } else if (msg.content.startsWith(prefix + 'np') && msg.author.id != UIDAdmin) {
        msg.channel.send('Access denied.');
    }

    // DB Testing
    if (msg.content.startsWith(prefix + 'db')) {
        colServers.find().toArray((err, items) => {
            let prefixList = "";
            for (var i = 0; i < items.length; i++) {
                prefixList = prefixList + items[i].prefix + " ";
            }
            prefixList = "The following prefixes are currently present in the database: `" + prefixList + "`";
            msg.channel.send(prefixList);
        });
    }

    // Bulk Delete
    if (msg.content.startsWith(prefix + 'clean') && msg.member.hasPermission("ADMINISTRATOR")) {
        console.log(prefix + 'clean run by ' + msg.author.username);
        msgContent = msg.content.split(" ")[1];
        if (msgContent == "all") {
            msg.channel.send("Attempting to delete all messages.");
            async function clear() {
                msg.delete();
                const fetched = await msg.channel.fetchMessages({limit: 99});
                msg.channel.bulkDelete(fetched);
            }
            clear();
        } else {
            msgCount = parseFloat(msg.content.split(" ")[1], 10);
            if (isNaN(msgCount) == true) {
                msg.channel.send("ERR: Please select a number between 1 and 100.");
            } else {
                if ((msgCount > 100) || (msgCount < 1)) {
                    msg.channel.send("ERR: Please select a number between 1 and 100.");
                } else {
                    msg.channel.bulkDelete(msgCount);
                }
            }
        }
    }

    // Set Prefix - Per Server
    if (msg.content.startsWith(prefix + 'prefix') && msg.member.hasPermission("ADMINISTRATOR")) {
        console.log(prefix + 'prefix run by ' + msg.author.username);
        newPrefix = msg.content.split(" ")[1];
        if (newPrefix == "`") {
            msg.channel.send("Invalid prefix selection. Please use another prefix.");
        } else {
            var query = { _id : msg.guild.id};
            colServers.find(query).toArray(function(err, result) {
                if (result.length > 0) {
                    if (msg.content.split(" ")[1] == undefined) {
                        msg.channel.send('The current prefix is ' + prefix);
                    } else {
                        prefix = newPrefix;
                        msg.channel.send('Prefix changed to ' + prefix);
                        colServers.update({_id : msg.guild.id}, { _id : msg.guild.id, serverName: msg.guild.name, prefix: newPrefix });
                        sleep(500);    
                        loadPrefixes();
                    }
                } else {
                    if (msg.content.split(" ")[1] == undefined) {
                        msg.channel.send('The current prefix is ' + prefix);
                    } else {
                        prefix = newPrefix;
                        msg.channel.send('Prefix changed to ' + prefix);
                        var myobj = { _id: msg.guild.id, serverName: msg.guild.name, prefix: newPrefix };
                        colServers.insertOne(myobj, function(err, res) {
                            if (err) throw err;
                            console.log("Server prefix object added");
                        }); 
                        sleep(500);   
                        loadPrefixes();
                    }
                }
            });
        }
    } else if (msg.content.startsWith(prefix + 'prefix') && msg.author.id != UIDAdmin) {
        msg.channel.send('Access denied.');
    }

    // List Subscribers
    if (msg.content === (prefix + 'sublist') && msg.author.id == UIDAdmin) {
        console.log(prefix + 'sublist run by ' + msg.author.username)

        function getChannelID(){ 
            let url = "https://api.twitch.tv/kraken/users?login=" + twitchUser;
            return httpGet(url,clientID,v5Accept); 
        }
        
        function httpGet(url,clientID,v5Accept){
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", url, false );
            xmlHttp.setRequestHeader("Client-ID",clientID);
            xmlHttp.setRequestHeader("Accept",v5Accept)
            xmlHttp.setRequestHeader("Authorization",auth.twitch);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        }
        
        let CID = JSON.parse(getChannelID()).users[0]._id;
        
        function getChannelSubs(){ 
            let url = "https://api.twitch.tv/kraken/channels/" + CID + "/subscriptions";
            return httpGet(url,clientID,v5Accept); 
        }
        
        let subs = JSON.parse(getChannelSubs());        
        let subCount = subs._total - 1;

        message = 'You currently have ' + subCount + ' subscribers on Twitch.\n';

        for (var i = 1; i <= subCount; i++) {
            if (subs.subscriptions[i].is_gift == false) {
                isGift = 'Paid/Prime';
            } else {
                isGift = 'Gift';
            };
            message = message + ('**' + subs.subscriptions[i].user.name + '** - Tier ' + (subs.subscriptions[i].sub_plan / 1000) + ' - ' + isGift + '\n');
            //msg.channel.send('**' + subs.subscriptions[i].user.name + '** - Tier ' + (subs.subscriptions[i].sub_plan / 1000) + ' - ' + isGift);
        }
        msg.channel.send(message);
    } else if (msg.content.startsWith(prefix + 'sublist') && msg.author.id != UIDAdmin) {
        msg.channel.send('Access denied.');
    }

    // Subscriber Count
    if (msg.content === (prefix + 'subcount') && msg.author.id == UIDAdmin) {
        console.log(prefix + 'subcount run by ' + msg.author.username)

        function getChannelID(){ 
            let url = "https://api.twitch.tv/kraken/users?login=" + twitchUser;
            return httpGet(url,clientID,v5Accept); 
        }
        
        function httpGet(url,clientID,v5Accept){
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", url, false );
            xmlHttp.setRequestHeader("Client-ID",clientID);
            xmlHttp.setRequestHeader("Accept",v5Accept)
            xmlHttp.setRequestHeader("Authorization",auth.twitch);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        }
        
        let CID = JSON.parse(getChannelID()).users[0]._id;
        
        function getChannelSubs(){ 
            let url = "https://api.twitch.tv/kraken/channels/" + CID + "/subscriptions";
            return httpGet(url,clientID,v5Accept); 
        }
        
        let subs = JSON.parse(getChannelSubs());        
        let subCount = subs._total - 1;

        msg.channel.send('Rowdy Rooster currently has ' + subCount + ' subscribers on Twitch.');
    } else if (msg.content.startsWith(prefix + 'subcount') && msg.author.id != UIDAdmin) {
        msg.channel.send('Access denied.');
    }

    // User Commands

    // Mixer Stats
    if (msg.content.startsWith(prefix + 'mixerstats')) {
        let msgContent = msg.content.split(" ")[1];
        const channelName = msgContent;

        mixerClient.use(new Mixer.OAuthProvider(client, {
            clientId: mixerClientID,
        }));
    
        mixerClient.request('GET', `channels/${channelName}`)
        .then(res => {
            const channel = res.body;
            const chName = channel.user.username;
            const chViewers = channel.viewersTotal;
            const chFollowers = channel.numFollowers;
            res.body.partnered === true ? chStatus = 'Partner' : chStatus = 'Broadcaster';
            // console.log(res.body);

            msg.channel.send('```css\n' + chName + '\nFollowers: ' + chFollowers + '\nChannel Views: ' + chViewers + '\nBroadcaster Status: ' + chStatus + '```');
        });
    }
    
    // Cat Facts Function
    function catFacts() {
        let msgContent = msg.content.split(" ")[1];

        function httpGet(){
            let url = 'https://cat-fact.herokuapp.com/facts';
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", url, false);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        }
        let catFacts = JSON.parse(httpGet());
        let catFactCount = catFacts.all.length;

        if (msgContent == undefined) {
            console.log(prefix + 'catfacts run by ' + msg.author.username);
            let factNumber = Math.floor(Math.random() * catFactCount);
            let catFactObject = catFacts.all[factNumber];
            let fact = catFactObject.text;
            let authorFirstName = catFactObject.user.name.first;
            let authorLastName = catFactObject.user.name.last;
            msg.channel.send('Cat Fact #' + factNumber + ': "' + fact + '" - ' + authorFirstName + ' ' + authorLastName);
        } else {
            console.log(prefix + 'catfacts ' + msgContent + ' run by ' + msg.author.username);
            msgContent = parseInt(msgContent, 10);
            if (msgContent > 0) {
                let factNumber = msgContent;
                let catFactObject = catFacts.all[factNumber];
                let fact = catFactObject.text;
                let authorFirstName = catFactObject.user.name.first;
                let authorLastName = catFactObject.user.name.last;
                msg.channel.send('Cat Fact #' + factNumber + ': "' + fact + '" - ' + authorFirstName + ' ' + authorLastName);
            } else {
                msg.channel.send('Use a number between 1 and ' + catFactCount + ' For example `' + prefix + 'catfacts 100`');
            }
        }
    }
    
    // Call Cat Facts
    if (msg.content.startsWith(prefix + 'catfact')) {
        catFacts();
    }
    
    // Live Status
    if (msg.content.startsWith(prefix + 'live')) {
        let msgContent = msg.content.split(" ")[1];
        console.log(prefix + 'live ' + msgContent + ' run by ' + msg.author.username);

        if (msgContent == undefined) {
            msg.channel.send('ERROR: Please include a channel name. For example: `' + prefix + 'live itsrowdyrooster`');
        } else {
            function getLiveStatus(){ 
                let url = 'https://api.twitch.tv/helix/streams?user_login=' + msgContent;
                return httpGet(url,clientID,v5Accept); 
            }
            
            function httpGet(url,clientID,v5Accept){
                let xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", url, false );
                xmlHttp.setRequestHeader("Client-ID",clientID);
                xmlHttp.setRequestHeader("Accept",v5Accept)
                xmlHttp.setRequestHeader("Authorization",auth.twitch);
                xmlHttp.send(null);
                return xmlHttp.responseText;
            }

            let liveStatus = JSON.parse(getLiveStatus());

            if (liveStatus.data.length === 0) {
                msg.channel.send('User is offline.');
            } else if (liveStatus.data[0].type === "live") {
                let username = liveStatus.data[0].user_name;
                let viewers = liveStatus.data[0].viewer_count;
                let timeStart = new Date(liveStatus.data[0].started_at);
                let timeNow = new Date(Date.now());
                let duration = new Date(timeNow - timeStart).toISOString().substr(11, 8);
                let time = duration.split(":");
                let hours = time[0];
                let minutes = time[1];

                if (hours == 0) {
                    msgTime = ' They have been live for ' + minutes + ' minutes.';
                } else {
                    msgTime = ' They have been live for ' + hours + ' hours and ' + minutes + ' minutes.';
                }
                
                msg.channel.send(username + ' is now live with ' + viewers + ' viewers!' + msgTime);
                twitchStats(msgContent);
                console.log(liveStatus);
                console.log(duration);
            } else {
               msg.channel.send(msgChannel + ' is currently offline.');
            }
        }
    }

    // Twitch Stats Function
    function twitchStats(msgContent) {
        console.log(prefix + 'stats ' + msgContent + ' run by ' + msg.author.username);

        if (msgContent == undefined) {
            msg.channel.send('ERROR: Please include a channel name. For example: `' + prefix + 'stats itsrowdyrooster`');
        } else {
            function getChannelID(){ 
                let url = 'https://api.twitch.tv/kraken/users?login=' + msgContent;
                return httpGet(url,clientID,v5Accept); 
            }
            
            function httpGet(url,clientID,v5Accept){
                let xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", url, false );
                xmlHttp.setRequestHeader("Client-ID",clientID);
                xmlHttp.setRequestHeader("Accept",v5Accept)
                xmlHttp.setRequestHeader("Authorization",auth.twitch);
                xmlHttp.send(null);
                return xmlHttp.responseText;
            }
            
            if (JSON.parse(getChannelID())._total === 0) {
                msg.channel.send('User not found.')
            } else {
                let CID = JSON.parse(getChannelID()).users[0]._id;
                
                function getChannel(){ 
                    let url = 'https://api.twitch.tv/kraken/channels/' + CID;
                    return httpGet(url,auth.clientID,v5Accept); 
                }

                function getChannelTeam(){
                    let url = 'https://api.twitch.tv/kraken/channels/' + CID + '/teams';
                    return httpGet(url,auth.clientID,v5Accept);
                }
                let channelInfo = JSON.parse(getChannel());
                let channelTeamInfo = JSON.parse(getChannelTeam());
                console.log('Obtaining ' + channelInfo.name + '\'s stats. ID: ' + CID);
                
                if (channelTeamInfo.teams[0] === undefined) {
                    var channelTeam = "None";
                } else {
                    var channelTeam = (JSON.parse(getChannelTeam()).teams[0].display_name);
                }

                if (channelInfo.partner === true) {
                    var broadcastStatus = "Partner";
                } else if (channelInfo.broadcaster_type === "affiliate") {
                    var broadcastStatus = "Affiliate";
                } else {
                    var broadcastStatus = "Broadcaster";
                }

                msg.channel.send('```\n' + channelInfo.name + '\nFollowers: ' + channelInfo.followers + '\nChannel Views: ' + channelInfo.views + '\nBroadcaster Status: ' + broadcastStatus + '\nChannel Team: ' + channelTeam + '\nURL: http://twitch.tv/' + msgContent + '```');
            }
        } 
    }

    // Twitch Stats
    if (msg.content.startsWith(prefix + 'stats')) {
        let msgContent = msg.content.split(" ")[1];
        twitchStats(msgContent);
    } 

    // Help 
    if (msg.content.startsWith('<@' + botUID + '> help') || msg.content.startsWith(prefix + 'help')) {
        let newMsg = "";
        if (msg.content.startsWith('<@' + botUID + '>')) { // Allows the user to ping the bot directly, in which case the bot will return the current prefix for command use
            newMsg = 'The prefix is currently set to `' + prefix + '`\n\n';
        }
        // I should clean this up at some point.
        newMsg = newMsg + '**Profile Command List**\n';
        newMsg = newMsg + '`' + prefix + 'createprofile` - Creates a profile on the bot\n';
        newMsg = newMsg + '`' + prefix + 'deleteprofile` - Deletes your profile from the database\n';
        newMsg = newMsg + '`' + prefix + 'profile` - Returns your profile\n';
        newMsg = newMsg + '`' + prefix + 'whoami` - Returns your profile\n';
        newMsg = newMsg + '`' + prefix + 'whois <user>` - Returns the users profile\n';
        newMsg = newMsg + '`' + prefix + 'profile add <twitch|twitter|facebook>` - Adds Twitch|Twitter|Facebook links to your profile\n';
        newMsg = newMsg + '`' + prefix + 'profile del <twitch|twitter|facebook>` - Removes Twitch|Twitter|Facebook links to your profile\n';
        newMsg = newmsg + '\n';
        newMsg = newMsg + '**Random Command List**\n';
        newMsg = newMsg + '`' + prefix + 'catfact` - Returns a random fact about cats\n';
        newMsg = newMsg + '`' + prefix + 'catfact <number>` - Returns the specificed cat fact\n';
        newMsg = newmsg + '\n';
        newMsg = newMsg + '**Twitch/Mixer Command List**\n';
        newMsg = newMsg + '`' + prefix + 'live <username>` - Returns if Twitch user indicated is currently live\n';
        newMsg = newMsg + '`' + prefix + 'stats <username>` - Returns Twitch stats of selected user\n';
        newMsg = newMsg + '`' + prefix + 'mixerstats <username>` - Returns the Mixer stats of the selected user\n';
        newMsg = newMsg + '\n';
        newMsg = newMsg + '**Bot Commands**'
        newMsg = newMsg + '`' + prefix + 'help` - Returns a list of bot commands\n';
        newMsg = newMsg + '\n';
        newMsg = newMsg + '**Admin Commands**\n';
        newMsg = newMsg + '`' + prefix + 'prefix` - Changes the prefix for the bot in the server\n';        newMsg = newMsg = '`' + prefix + '';
        msg.channel.send(newMsg);
    }

    // Create Profile
    if (msg.content.startsWith(prefix + 'createprofile')) {
        loadUsers();
        let newUser = { _id: msg.author.id, displayName: msg.author.username };

        let query = { _id: msg.author.id };
        colUsers.find(query).toArray(function(err, result) {
            if (result.length > 0) {
                msg.channel.send("Profile '" + result[0].displayName + "' already exists with ID " + result[0]._id);
            } else {
                msg.channel.send("User is not present in the database.\nAdding user.")
                colUsers.insertOne(newUser, function(err, res) {
                    if (err) throw err;
                    console.log("1 User Added");
                });
            }
        });

        
    }

    function whoIs(user) {
        colUsers.find(user).toArray(function(err, result) {
            if (result.length > 0) {
                newMsg = "```";
                newMsg = newMsg + "Display Name: " + result[0].displayName + "\n";
                newMsg = newMsg + "User ID: " + result[0]._id + "\n";
                newMsg = result[0].twitch != undefined ? newMsg = newMsg + "Twitch: " + result[0].twitch + "\n" : newMsg;
                newMsg = result[0].twitter != undefined ? newMsg = newMsg + "Twitter: " + result[0].twitter + "\n" : newMsg;
                newMsg = result[0].facebook != undefined ? newMsg = newMsg + "Facebook: " + result[0].facebook + "\n" : newMsg;
                newMsg = newMsg + "```";
                msg.channel.send(newMsg);
                //msg.channel.send("Profile '" + result[0].displayName + "' already exists with ID " + result[0]._id);
            } else {
                msg.channel.send("User profile is not present in the database. Please run `" + prefix + "createprofile` to be added to the datebase.")
            }
        });

    }

    // Who Is
    if (msg.content.startsWith(prefix + 'whois')) {
        let user = msg.content.split(" ")[1].substring(3,21);
        whoIs(user);
    }
    
    // Who Am I?
    if (msg.content.startsWith(prefix + 'whoami')) {
        let user = { _id: msg.author.id };
        whoIs(user);
    }

    // Add User Attribute
    function updateUser(usrId, usrHeader, usrValue, msg) {
        colUsers.update({ "_id" : usrId }, { "$set" : {[usrHeader] : usrValue}});
        sleep(1000);
        msg.channel.send("Profile updated.");
    }

    // Del User Attribute
    function delUserAtt(usrId, usrHeader, usrValue, msg) {
        colUsers.update({ "_id" : usrId }, { "$unset" : {[usrHeader] : usrValue}});
        sleep(1000);
        msg.channel.send("Profile updated.");
    }

    // Delete Profile
    if (msg.content.startsWith(prefix + "deleteprofile")) {
        loadUsers();
        let delUser = { _id: msg.author.id };
        colUsers.remove(delUser, function(err, res) {
            if (err) throw err;
            console.log("1 User Added");
        });
    }

    // Profile
    if (msg.content.startsWith(prefix + 'profile')) {
        loadUsers();
        let msgContent = msg.content.split(" ")[1];
        if (msgContent == "add") {
            msgContent = msg.content.split(" ")[2];
            if (msgContent == "twitch") {
                msgContent = msg.content.split(" ")[3];
                if (msgContent == null) {
                    msg.channel.send("Please specify a Twitch link. For example `" + prefix + "profile add twitch http://www.twitch.tv/itsrowdyrooster`");
                } else {
                    let query = { "_id" : msg.author.id };
                    colUsers.find(query).toArray(function(err, result) {
                    if (result.length > 0) {
                        usrId = msg.author.id;
                        usrHeader = "twitch";
                        usrValue = msgContent;
                        updateUser(usrId, usrHeader, usrValue, msg);
                    } else {
                        msg.channel.send("User profile is not present in the database. Please run `" + prefix + "createprofile` to be added to the datebase.")
                    }
                    });
                }
            } else if (msgContent == "twitter") {
                msgContent = msg.content.split(" ")[3];
                if (msgContent == null) {
                    msg.channel.send("Please specify a Twitter link. For example `" + prefix + "profile add twitch http://www.twitter.com/itsrowdyrooster`");
                } else {
                    let query = { "_id" : msg.author.id };
                    colUsers.find(query).toArray(function(err, result) {
                    if (result.length > 0) {
                        usrId = msg.author.id;
                        usrHeader = "twitter";
                        usrValue = msgContent;
                        updateUser(usrId, usrHeader, usrValue, msg);
                    } else {
                        msg.channel.send("User profile is not present in the database. Please run `" + prefix + "createprofile` to be added to the datebase.")
                    }
                    });
                }
            } else if (msgContent == "facebook") {
                msgContent = msg.content.split(" ")[3];
                if (msgContent == null) {
                    msg.channel.send("Please specify a Facebook link. For example `" + prefix + "profile add twitch http://www.facebook.com/itsrowdyrooster`");
                } else {
                    let query = { "_id" : msg.author.id };
                    colUsers.find(query).toArray(function(err, result) {
                    if (result.length > 0) {
                        usrId = msg.author.id;
                        usrHeader = "facebook";
                        usrValue = msgContent;
                        updateUser(usrId, usrHeader, usrValue, msg);
                    } else {
                        msg.channel.send("User profile is not present in the database. Please run `" + prefix + "createprofile` to be added to the datebase.")
                    }
                    });
                }
            } else {
                msg.channel.send("This is where we will add a new thing.");
            }
        } else if (msgContent == "del") {
            msgContent = msg.content.split(" ")[2];
            if (msgContent == "twitch" || msgContent == "twitter" || msgContent == "facebook") {
                let query = { "_id" : msg.author.id };
                colUsers.find(query).toArray(function(err, result) {
                    if (result.length > 0) {
                        method = "del";
                        usrId = msg.author.id;
                        usrHeader = msgContent;
                        usrValue = result[0].twitch;
                        delUserAtt(usrId, usrHeader, usrValue, msg);
                    } else {
                        msg.channel.send("User profile is not present in the database. Please run `" + prefix + "createprofile` to be added to the datebase.")
                    }
                });
            } else {
                msg.channel.send("Please enter the name of the entry you would like to delete. For example `" + prefix + "profile del twitch`");
            }
        } else{
            user = msg.author.id;
            whoIs(user);
        }
    }

    // Admin Check
    if (msg.content.startsWith(prefix + 'admin')) {
        if (msg.member.hasPermission("ADMINISTRATOR")) {
            msg.channel.send("This user has Administrator permissions.");
        } else {
            msg.channel.send("This user is not an administrator.");
        }
    }

    // Ping
    if (msg.content.startsWith(prefix + 'ping') || msg.content.startsWith('<@' + botUID + '> ping')) {
        msg.channel.send("Pong!");
    }

});

});

client.login(auth.token);