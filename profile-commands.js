const functions = require('./functions.js')

exports.create = function create(msg,colUsers) {
    let newUser = { _id: msg.author.id, displayName: msg.author.username };

    let query = { _id: msg.author.id };
    colUsers.find(query).toArray(function(err, result) {
        if (result.length > 0) {
            msg.channel.send(`Profile ${result[0].displayName} already exists with ID ${result[0]._id}`);
        } else {
            msg.channel.send("User is not present in the database.\nAdding user.")
            colUsers.insertOne(newUser, function(err, res) {
                if (err) throw err;
                console.log("1 User Added");
            });
        }
    });
}

exports.whoIs = function whoIs(msg,user,colUsers) {
    colUsers.find(user).toArray(function(err, result) {
        if (result.length > 0) {
            let newMsg = `\`\`\`Display Name: ${result[0].displayName}\n`;
            newMsg += `User ID: ${result[0]._id}\n`;
            newMsg = result[0].twitch != undefined ? newMsg += `Twitch: ${result[0].twitch}\n` : newMsg;
            newMsg = result[0].twitter != undefined ? newMsg += `Twitter: ${result[0].twitter}\n` : newMsg;
            newMsg = result[0].facebook != undefined ? newMsg += `Facebook: ${result[0].facebook}\n` : newMsg;
            newMsg += `\`\`\``;
            msg.channel.send(newMsg);
        } else {
            msg.channel.send(`User profile is not present in the database. Please run \`${prefix}createprofile\` to be added to the datebase.`)
        }
    });

}

exports.updateUser = function updateUser(usrId, usrHeader, usrValue, msg, colUsers) {
    colUsers.update({ "_id" : usrId }, { "$set" : {[usrHeader] : usrValue}})
    functions.sleepCommand(1000)
    msg.channel.send("Profile updated.")
}

