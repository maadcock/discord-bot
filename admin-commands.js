const functions = require('./functions.js')

exports.serverCount = function serverCount(msg,dbServers) {
    msg.channel.send(`I am currently present in ${dbServers.length} servers.`)
}

exports.shutdown = function shutdown(msg,client) {
    msg.channel.send('My battery is low and it’s getting dark. Goodbye.')
    client.destroy()
}

exports.nowPlaying = function nowPlaying(msg,prefix,client) {
    if (msg.content.split(" ")[1] == undefined) {
        msg.channel.send(`ERROR: Please include an activity name. For example: \`${prefix}np A Good Movie\``)
    } else {
        stringLen = msg.content.split(" ").length
        let newActivity = ""
        for (let i = 1; i < msg.content.split(" ").length; i++) {
            newActivity = newActivity + msg.content.split(" ")[i] + " "
        }
        client.user.setActivity(newActivity, { type: 'PLAYING' })
    }
}

exports.bulkDelete = function bulkDelete(msg) {
    msgContent = msg.content.split(" ")[1]
    if (msgContent == "all") {
        msg.channel.send("Attempting to delete all messages.")
        async function clear() {
            msg.delete()
            const fetched = await msg.channel.fetchMessages({limit: 99})
            msg.channel.bulkDelete(fetched)
        }
        clear()
    } else {
        msgCount = parseFloat(msg.content.split(" ")[1], 10)
        if (isNaN(msgCount) == true) {
            msg.channel.send("ERR: Please select a number between 1 and 100.")
        } else {
            if ((msgCount > 100) || (msgCount < 1)) {
                msg.channel.send("ERR: Please select a number between 1 and 100.")
            } else {
                msg.channel.bulkDelete(msgCount)
            }
        }
    }
}

exports.timeoutList = function timeoutList(colTimeout,msg) {
    let query = {"server" : msg.guild.id}
    colTimeout.find(query).toArray(function(err, result) {
        if (result.length > 0) {
            let newMsg = "**Current Users in Timeout:**\n"
            for (let i = 0; i < result.length; i++) {
                user = result[i]._id
                newMsg += `<@${user}>\n`
            }
            msg.channel.send(newMsg)
        } else {
            msg.channel.send("No users are currently in timeout.")
        }
    })
}

exports.timeout = function timeout(msg,colServers,colTimeout,prefix) {
    let query = {_id : msg.guild.id}
    if (msg.content.startsWith(`${prefix}timeout setrole`)) {
        colServers.find(query).toArray(function(err, result) {
            if (result.length > 0) {
                msgContent = msg.content.split(" ")[2]
                if (msgContent == undefined) {
                    msg.channel.send(`Please specify a role. Example: \`${prefix}timeout setrole <role>\``)
                } else {
                    svrId = msg.guild.id
                    svrHeader = "timeoutRole"
                    svrValue = msgContent
                    functions.updateServer(svrId,svrHeader,svrValue,msg,colServers)
                }
            } else {
                msgContent = msg.content.split(" ")[2]
                let myobj = { _id: msg.guild.id, serverName: msg.guild.name, timeoutRole: msgContent }
                colServers.insertOne(myobj, function(err, res) {
                    if (err) throw err
                    console.log("Server object added")
                }) 
                functions.sleep(500)   
                functions.loadServers()
            }
        })
    } else {
        colServers.find(query).toArray(function(err, result) {
            if (result.length > 0) {
                timeoutRole = result[0].timeoutRole
                if (timeoutRole == undefined) {
                    msg.channel.send(`Timeout role not set! Please set the timeout role by using the command \`${prefix}timeout setrole <role>\``)
                } else {
                    timeoutRole = result[0].timeoutRole.substring(3,21)
                    msgContent = msg.content.split(" ")[1]
                    if (msgContent == undefined) {
                        msg.channel.send(`ERR: Please specify a user. For example: \`${prefix}timeout <user>\``)
                    } else {
                        let user = msg.guild.members.get(msgContent.substring(2,20))
                        let userRoles = user.roles.map(role => role.id)
                        query = {_id :msgContent.substring(2,20)}
                        colTimeout.find(query).toArray(function(err, result) {
                            if (result.length > 0) {
                                msg.channel.send("Removing user from timeout.")
                                colTimeout.remove(query)
                                user.removeRole(timeoutRole)
                                userRoles = result[0].roles
                                for (let i = 0; i < userRoles.length; i++) {
                                    user.addRole(userRoles[i])
                                }
                            } else {
                                let timeoutUsr = { "_id" : msgContent.substring(2,20), "roles" : userRoles, "server" : msg.guild.id }
                                colTimeout.insertOne(timeoutUsr)
                                for (let i = 1; i < userRoles.length; i++) {
                                    user.removeRole(userRoles[i])
                                }
                                user.addRole(timeoutRole)
                                msg.channel.send(`Sending ${msgContent} to timeout.`)
                            }
                        })
                    }
                }
            } else {
                msg.channel.send(`Timeout role not set! Please set the timeout role by using the command \`${prefix}timeout setrole <role>\``)
            }
        })
    }
}

exports.setPrefix = function setPrefix(msg,prefix,colServers) {
    newPrefix = msg.content.split(" ")[1]
    if (newPrefix == "`") {
        msg.channel.send("Invalid prefix selection. Please use another prefix.")
    } else {
        let query = { _id : msg.guild.id}
        colServers.find(query).toArray(function(err, result) {
            if (result.length > 0) {
                if (msg.content.split(" ")[1] == undefined) {
                    msg.channel.send(`The current prefix is ${prefix}`)
                } else {
                    msg.channel.send(`Prefix changed to ${newPrefix}`)
                    svrId = msg.guild.id
                    svrHeader = "prefix"
                    svrValue = newPrefix
                    functions.updateServer(svrId,svrHeader,svrValue,msg,colServers)
                }
            } else {
                if (msg.content.split(" ")[1] == undefined) {
                    msg.channel.send(`The current prefix is ${prefix}`)
                } else {
                    prefix = newPrefix
                    msg.channel.send(`Prefix changed to ${newPrefix}`)
                    let myobj = { _id: msg.guild.id, serverName: msg.guild.name, prefix: newPrefix }
                    colServers.insertOne(myobj, function(err, res) {
                        if (err) throw err
                        console.log("Server prefix object added")
                    }) 
                    functions.sleep(500)   
                    functions.loadServers()
                }
            }
        })
    }

}

