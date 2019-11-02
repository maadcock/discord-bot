// Variables
const Discord = require('discord.js')
const client = new Discord.Client()
const Mixer = require('@mixer/client-node')
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
const v5Accept = "application/vnd.twitchtv.v5+json"
const mixerClient = new Mixer.Client(new Mixer.DefaultRequestRunner())
const MongoClient = require('mongodb').MongoClient

const express = require('express')
const app = express()
const port = 3030

const functions = require('./functions.js')
const commands = require('./user-commands.js')
const pCommands = require('./profile-commands.js')
const aCommands = require('./admin-commands.js')
const oCommands = require('./owner-commands.js')

// Auth
const auth = require('./auth.json')
const twitchOAuth = auth.twitch
const clientID = auth.clientID
const UIDAdmin = auth.adminUID
const botUID = auth.botUID
const twitchUser = auth.twitchUser
const mixerClientID = auth.mixerClient
const mongoUrl = auth.mongoUrl

let prefix = '~' // Set default prefix

// Discord Bot Login
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity('maadha.us', { type: 'PLAYING' })
})

// MongoDB Connection
MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err
    const dbo = db.db("maadhaus-dev")
    const colUsers = dbo.collection("users")
    const colServers = dbo.collection("servers")
    const colTimeout = dbo.collection("timeout")

    app.get('/', (req, res) => res.send("Hello world!"))
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))

    functions.loadServers(colServers)
    functions.loadUsers(colUsers)

// On Message Commands
client.on('message', msg => {

       for (let i = 0; i < dbServers.length; i++) {
            if (dbServers[i]._id == msg.guild.id) {
                prefix = dbServers[i].prefix
            }
        }

        // Server Admin Commands

        // Server Count
        if (msg.content.startsWith(`${prefix}servercount`) || msg.content.startsWith(`<@${botUID} How many servers are using you?`) && msg.author.id == UIDAdmin) {
            aCommands.serverCount(msg,dbServers)
        }

        // Shutdown
        if (msg.content.startsWith(`${prefix}shutdown`) && msg.author.id == UIDAdmin) {
            aCommands.shutdown(msg,client)
        } else if (msg.content.startsWith(`${prefix}shutdown`) && msg.author.id != UIDAdmin) {
            msg.channel.send('Access denied.')
        }
        
        // Now Playing
        if (msg.content.startsWith(`${prefix}np`) && msg.author.id == UIDAdmin) {
            functions.logCommand(msg)
            aCommands.nowPlaying(msg,prefix,client)
        } else if (msg.content.startsWith(`${prefix}np`) && msg.author.id != UIDAdmin) {
            msg.channel.send('Access denied.')
        }

        // Bulk Message Delete
        if (msg.content.startsWith(`${prefix}clean`) && msg.member.hasPermission("ADMINISTRATOR")) {
            functions.logCommand(msg)
            aCommands.bulkDelete(msg)
        }

        // Timeout
        if (msg.content.startsWith(`${prefix}timeout`) && msg.member.hasPermission("ADMINISTRATOR")) {
            functions.logCommand(msg)
            if (msg.content.startsWith(`${prefix}timeoutlist`)) {
                aCommands.timeoutList(colTimeout,msg)
            } else {
                aCommands.timeout(msg,colServers,colTimeout,prefix)
            }
        } else if (msg.content.startsWith(`${prefix}timeout`) && msg.member.hasPermission("ADMINISTRATOR")) {
            msg.channel.send('Access denied.')
        }

        // Set Prefix - Per Server
        if (msg.content.startsWith(`${prefix}prefix`) && msg.member.hasPermission("ADMINISTRATOR")) {
            functions.logCommand(msg)
            aCommands.setPrefix(msg,prefix,colServers)
        } else if (msg.content.startsWith(`${prefix}prefix`) && msg.member.hasPermission("ADMINISTRATOR")) {
            msg.channel.send('Access denied.')
        }

        // Bot List Subscribers
        if (msg.content === (`${prefix}sublist`) && msg.author.id == UIDAdmin) {
            functions.logCommand(msg)
            let ifCount = true
            oCommands.fetchSubs(msg,twitchUser,clientID,v5Accept,v5Accept,twitchOAuth,XMLHttpRequest,ifCount)
        } else if (msg.content.startsWith(`${prefix}sublist`) && msg.author.id != UIDAdmin) {
            msg.channel.send('Access denied.')
        }

        // Subscriber Count
        if (msg.content === (`${prefix}subcount`) && msg.author.id == UIDAdmin) {
            functions.logCommand(msg)
            let ifCount = false
            oCommands.fetchSubs(msg,twitchUser,clientID,v5Accept,v5Accept,twitchOAuth,XMLHttpRequest,ifCount)
        } else if (msg.content.startsWith(`${prefix}subcount`) && msg.author.id != UIDAdmin) {
            msg.channel.send('Access denied.')
        }

        // Mixer Stats
        if (msg.content.startsWith(`${prefix}mixerstats`)) {
            functions.logCommand(msg)
            commands.mixer(msg,mixerClientID,mixerClient)
        }
        
        // Cat Facts
        if (msg.content.startsWith(`${prefix}catfact`)) {
            functions.logCommand(msg)
            commands.catFacts(msg,XMLHttpRequest)
        }
        
        // Live Status
        if (msg.content.startsWith(`${prefix}live`)) {
            let msgContent = msg.content.split(" ")[1]
            functions.logCommand(msg)

            if (msgContent == undefined) {
                msg.channel.send(`ERROR: Please include a channel name. For example: \`${prefix}live ${twitchUser}\``)
            } else {
                function getLiveStatus(){ 
                    let url = `https://api.twitch.tv/helix/streams?user_login=${msgContent}`
                    return httpGet(url,clientID,v5Accept) 
                }
                
                function httpGet(url,clientID,v5Accept){
                    let xmlHttp = new XMLHttpRequest()
                    xmlHttp.open( "GET", url, false )
                    xmlHttp.setRequestHeader("Client-ID",clientID)
                    xmlHttp.setRequestHeader("Accept",v5Accept)
                    xmlHttp.setRequestHeader("Authorization",twitchOAuth)
                    xmlHttp.send(null)
                    return xmlHttp.responseText
                }

                let liveStatus = JSON.parse(getLiveStatus())

                if (liveStatus.data.length === 0) {
                    msg.channel.send('User is offline.')
                } else if (liveStatus.data[0].type === "live") {
                    let username = liveStatus.data[0].user_name
                    let viewers = liveStatus.data[0].viewer_count
                    let timeStart = new Date(liveStatus.data[0].started_at)
                    let timeNow = new Date(Date.now())
                    let duration = new Date(timeNow - timeStart).toISOString().substr(11, 8)
                    let time = duration.split(":")
                    let hours = time[0]
                    let minutes = time[1]

                    if (hours == 0) {
                        msgTime = ` They have been live for ${minutes} minutes.`
                    } else {
                        msgTime = ` They have been live for ${hours} hours and ${minutes} minutes.`
                    }
                    
                    msg.channel.send(`${username} is now live with ${viewers} viewers! ${msgTime}`)
                    twitchStats(msgContent)
                    console.log(liveStatus)
                    console.log(duration)
                } else {
                msg.channel.send(`${msgChannel} is currently offline.`)
                }
            }
        }

        // Twitch Stats Function
        function twitchStats(msgContent) {
            functions.logCommand(msg)
            if (msgContent == undefined) {
                msg.channel.send(`ERROR: Please include a channel name. For example: \`${prefix}stats ${twitchUser}\``)
            } else {
                function getChannelID(){ 
                    let url = `https://api.twitch.tv/kraken/users?login=${msgContent}`
                    return httpGet(url,clientID,v5Accept) 
                }
                
                function httpGet(url,clientID,v5Accept){
                    let xmlHttp = new XMLHttpRequest()
                    xmlHttp.open( "GET", url, false )
                    xmlHttp.setRequestHeader("Client-ID",clientID)
                    xmlHttp.setRequestHeader("Accept",v5Accept)
                    xmlHttp.setRequestHeader("Authorization",twitchOAuth)
                    xmlHttp.send(null)
                    return xmlHttp.responseText
                }

                if (JSON.parse(getChannelID())._total === 0) {
                    msg.channel.send('User not found.')
                } else {
                    let CID = JSON.parse(getChannelID()).users[0]._id
                    
                    function getChannel(){ 
                        let url = `https://api.twitch.tv/kraken/channels/${CID}`
                        return httpGet(url,auth.clientID,v5Accept) 
                    }

                    function getChannelTeam(){
                        let url = `https://api.twitch.tv/kraken/channels/${CID}/teams`
                        return httpGet(url,auth.clientID,v5Accept)
                    }
                    let channelInfo = JSON.parse(getChannel())
                    let channelTeamInfo = JSON.parse(getChannelTeam())
                    console.log(`Obtaining ${channelInfo.name}'s stats. ID: ${CID}`)
                    
                    if (channelTeamInfo.teams[0] === undefined) {
                        channelTeam = "None"
                    } else {
                        channelTeam = (JSON.parse(getChannelTeam()).teams[0].display_name)
                    }

                    if (channelInfo.partner === true) {
                        broadcastStatus = "Partner"
                    } else if (channelInfo.broadcaster_type === "affiliate") {
                        broadcastStatus = "Affiliate"
                    } else {
                        broadcastStatus = "Broadcaster"
                    }

                    msg.channel.send(`\`\`\`\n${channelInfo.name}\nFollowers: ${channelInfo.followers}\nChannel Views: ${channelInfo.views}\nBroadcaster Status: ${broadcastStatus}\nChannel Team: ${channelTeam}\nURL: http://twitch.tv/${msgContent}\`\`\``)
                }
            } 
        }

        // Twitch Stats
        if (msg.content.startsWith(`${prefix}stats`)) {
            functions.logCommand(msg)
            let msgContent = msg.content.split(" ")[1]
            twitchStats(msgContent)
        } 

        // Help 
        if (msg.content.startsWith(`<@${botUID}> help`) || msg.content.startsWith(`${prefix}help`)) {
            functions.logCommand(msg)
            commands.help(prefix,msg,botUID)
        }

        // Create Profile
        if (msg.content.startsWith(`${prefix}createprofile`)) {
            loadUsers()
            functions.logCommand(msg)
            pCommands.create(msg,colUsers)            
        }

        // Who Is
        if (msg.content.startsWith(`${prefix}whois`)) {
            functions.logCommand(msg)
            let user = msg.content.split(" ")[1].substring(3,21)
            pCommands.whoIs(msg,user,colUsers)
        }
        
        // Who Am I?
        if (msg.content.startsWith(`${prefix}whoami`)) {
            functions.logCommand(msg)
            let user = { _id: msg.author.id }
            pCommands.whoIs(msg,user,colUsers)
        }

        // Del User Attribute
        function delUserAtt(usrId, usrHeader, usrValue, msg) {
            colUsers.update({ "_id" : usrId }, { "$unset" : {[usrHeader] : usrValue}})
            functions.sleep(1000)
            msg.channel.send("Profile updated.")
        }

        // Delete Profile
        if (msg.content.startsWith(`${prefix}deleteprofile`)) {
            functions.logCommand(msg)
            loadUsers()
            let delUser = { _id: msg.author.id }
            colUsers.remove(delUser, function(err, res) {
                if (err) throw err
                console.log("1 User Added")
            })
        }

        // Add Link Function
        function addLink(msg, platform) {
            msgContent = msg.content.split(" ")[3]
            if (msgContent == null) {
                msg.channel.send(`Please specify a ${platform.charAt(0).toUpperCase()}${platform.substr(1).toLowerCase()} link. For example \`${prefix}profile add ${platform} http://www.${platform}.com/${twitchUser}\``)
            } else {
                let query = { "_id" : msg.author.id }
                colUsers.find(query).toArray(function(err, result) {
                if (result.length > 0) {
                    usrId = msg.author.id
                    usrHeader = platform
                    usrValue = msgContent
                    pCommands.updateUser(usrId, usrHeader, usrValue, msg, colUsers)
                } else {
                    msg.channel.send(`User profile is not present in the database. Please run \`${prefix}createprofile\` to be added to the datebase.`)
                }
                })
            }
        }

        // Profile
        if (msg.content.startsWith(`${prefix}profile`)) {
            functions.logCommand(msg)
            functions.loadUsers(colUsers)
            let msgContent = msg.content.split(" ")[1]
            if (msgContent == "add") {
                msgContent = msg.content.split(" ")[2]
                if (msgContent == "twitch" || msgContent == "twitter" || msgContent == "facebook" || msgContent == "instagram") {
                    platform = msgContent
                    addLink(msg, platform)
                } else {
                    msg.channel.send(`Please specify a platform. For example \`${prefix}profile add <platform>\`\nPlatform options: \`twitch | twitter | facebook | instagram\``)
                }
            } else if (msgContent == "del" || msgContent == "delete") {
                msgContent = msg.content.split(" ")[2]
                if (msgContent == "twitch" || msgContent == "twitter" || msgContent == "facebook" || msgContent == "instagram") {
                    let query = { "_id" : msg.author.id }
                    colUsers.find(query).toArray(function(err, result) {
                        if (result.length > 0) {
                            method = "del"
                            usrId = msg.author.id
                            usrHeader = msgContent
                            usrValue = result[0].twitch
                            delUserAtt(usrId, usrHeader, usrValue, msg)
                        } else {
                            msg.channel.send(`User profile is not present in the database. Please run \`${prefix}createprofile\` to be added to the datebase.`)
                        }
                    })
                } else {
                    msg.channel.send(`Please enter the name of the entry you would like to delete. For example \`${prefix}profile del twitch\``)
                }
            } else {
                user = msg.author.id
                pCommands.whoIs(msg,user,colUsers)
            }
        }
    })
})

client.login(auth.token)