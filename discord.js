const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('Screams of Silence', { type: 'LISTENING' });
});

// Global Settings
var prefix = '~';
const clientID = auth.clientID;
const v5Accept = "application/vnd.twitchtv.v5+json";
const UIDAdmin = auth.adminUID;
const twitchUser = auth.twitchUser;
const bungieAuth = auth.bungie;

// On Message Commands
client.on('message', msg => {

    // Admin Commands
    if (msg.content.startsWith(prefix)) {
        if (msg.author.id == UIDAdmin) {
            if (msg.content.startsWith(prefix + 'prefix')) {
                console.log(prefix + 'prefix run by ' + msg.author.username);
                if (msg.content.split(" ")[1] == undefined) {
                    msg.channel.send('The current prefix is ' + prefix);
                } else {
                    prefix = msg.content.split(" ")[1];
                    msg.channel.send('Prefix changed to ' + prefix);
                }
            }

            // List Subscribers
            if (msg.content === (prefix + 'sublist')) {
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

                msg.channel.send('You currently have ' + subCount + ' subscribers on Twitch.');

                for (var i = 1; i <= subCount; i++) {
                    if (subs.subscriptions[i].is_gift == false) {
                        isGift = 'Paid/Prime';
                    } else {
                        isGift = 'Gift';
                    };
                    msg.channel.send('**' + subs.subscriptions[i].user.name + '** - Tier ' + (subs.subscriptions[i].sub_plan / 1000) + ' - ' + isGift);
                }
            }

            // Subscriber Count
            if (msg.content === (prefix + 'subcount')) {
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
            }

        } else {
            msg.channel.send('Access denied.');
        }
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
                msg.channel.send(msgContent + ' is now live!');
            } else {
               msg.channel.send(msgChannel + ' is currently offline.');
            }
        }
    }

    // Twitch Stats
    if (msg.content.startsWith(prefix + 'stats')) {
        let msgContent = msg.content.split(" ")[1];
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

                msg.channel.send('```css\n' + channelInfo.name + '\nFollowers: ' + channelInfo.followers + '\nChannel Views: ' + channelInfo.views + '\nBroadcaster Status: ' + broadcastStatus + '\nChannel Team: ' + channelTeam + '```');
            }
        } 
    } 
});

client.login(auth.token);