// Variables
const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const Mixer = require('@mixer/client-node');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Discord Bot Login
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('maadha.us', { type: 'PLAYING' });
});

// Global Settings
var prefix = '~';
const clientID = auth.clientID;
const v5Accept = "application/vnd.twitchtv.v5+json";
const UIDAdmin = auth.adminUID;
const twitchUser = auth.twitchUser;
const bungieAuth = auth.bungie;
const mixerClientID = auth.mixerClient;
const mixerClient = new Mixer.Client(new Mixer.DefaultRequestRunner());
const upsToken = auth.upsToken;
const upsUser = auth.upsUser;
const upsPass = auth.upsPass;

// On Message Commands
client.on('message', msg => {

    // Admin Commands
    if (msg.content.startsWith(prefix + 'shutdown') && msg.author.id == UIDAdmin) {
        msg.channel.send('My battery is low and it’s getting dark. Goodbye.');
        client.destroy();
    } else if (msg.content.startsWith(prefix + 'shutdown') && msg.author.id != UIDAdmin) {
        msg.channel.send('Access denied.');
    }
    
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
    
    if (msg.content.startsWith(prefix + 'prefix') && msg.author.id == UIDAdmin) {
        console.log(prefix + 'prefix run by ' + msg.author.username);
        if (msg.content.split(" ")[1] == undefined) {
            msg.channel.send('The current prefix is ' + prefix);
        } else {
            prefix = msg.content.split(" ")[1];
            msg.channel.send('Prefix changed to ' + prefix);
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

    // UPS Tracking
    if (msg.content.startsWith(prefix + 'UPS')) {
        let msgContent = msg.content.split(" ")[1];
        msg.channel.send('Check UPS tracking number ' + msgContent);

        function httpGet(){
            let xmlHttp = new XMLHttpRequest();
            let url = "https://wwwcie.ups.com/rest/Track";
            xmlHttp.open("GET", url);
            //xmlHttp.setRequestHeader("UPSSecurity", '"UsernameToken": { "Username": "' + upsUser + '", "Password": "' + upsPass + '"}, "ServiceAccessToken": { "AccessLicenseNumber": "' + upsToken + '"}');
            //xmlHttp.setRequestHeader("TrackRequest",'"Request": {"RequestOption": "1", "TransactionReference": {"CustomerContext": "Your Test Case Summary Description" }}, "InquiryNumber": "' + msgContent + '"');
                

            //xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            //xmlHttp.send(JSON.stringify({ "UPSSecurity": { "UsernameToken": { "Username": '"' + upsUser + '"', "Password": '"' + upsPass + '"'}, "ServiceAccessToken": { "AccessLicenseNumber": '"' + upsToken + '"'}}, "TrackRequest": { "Request": {"RequestOption": "1", "TransactionReference": {"CustomerContext": "Your Test Case Summary Description" }}, "InquiryNumber": '"' + msgContent + '"'}}));
            return xmlHttp.responseText;
        }

        console.log(httpGet());

    }

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

    // Help Direct
    if (msg.content.startsWith('<@494323715215982592> help') || msg.content.startsWith(prefix + 'help')) {
        let newMsg = "";
        if (msg.content.startsWith('<@494323715215982592>')) {
            newMsg = 'The prefix is currently set to `' + prefix + '`\n\n';
        }
        newMsg = newMsg + '**Current Command List**\n';
        newMsg = newMsg + '`' + prefix + 'catfact` - Returns a random fact about cats\n';
        newMsg = newMsg + '`' + prefix + 'catfact <number>` - Returns the specificed cat fact\n';
        newMsg = newMsg + '`' + prefix + 'live <username>` - Returns if Twitch user indicated is currently live\n';
        newMsg = newMsg + '`' + prefix + 'stats <username>` - Returns Twitch stats of selected user\n';
        newMsg = newMsg + '`' + prefix + 'mixerstats <username>` - Returns the Mixer stats of the selected user\n';
        newMsg = newMsg + '`' + prefix + 'help` - Returns a list of bot commands\n';
        newMsg = newMsg + '\n';
        newMsg = newMsg + '**Upcoming/Partial Commands**\n';
        newMsg = newMsg + '`' + prefix + 'UPS <UPS Tracking Number>` - Returns the current status of the indicated tracking number. *Currently incomplete and nonfunctional*';
        msg.channel.send(newMsg);
    }

});

client.login(auth.token);