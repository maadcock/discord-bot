// Pull Server List from db
exports.loadServers = function loadServers(colServers) {
    colServers.find().toArray(function(err, result) {
        if (result.length > 0) {
            dbServers = result
        }
    })
}

// Load Users from Db
exports.loadUsers = function loadUsers(colUsers) {
    colUsers.find().toArray(function(err, result) {
        if (result.length > 0) {
            dbUsers = result
        }
    })
}


exports.logCommand = function logCommand(msg) {
    console.log(`${msg.content.split(" ")[0]} run by ${msg.author.username}`)
}

exports.sleepCommand = function sleep(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

exports.updateServer = function updateServer(svrId,svrHeader,svrValue,msg,colServers) {
    colServers.update({ "_id" : svrId }, { "$set" : {[svrHeader] : svrValue}})
    msg.channel.send("Server entry updated.")
    exports.sleepCommand(500)
    exports.loadServers(colServers)
}
