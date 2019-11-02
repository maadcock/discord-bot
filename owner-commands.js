exports.fetchSubs = function fetchSubs(msg,twitchUser,clientID,v5Accept,v5Accept,twitchOAuth,XMLHttpRequest,ifCount) {
    function getChannelID(){ 
        let url = `https://api.twitch.tv/kraken/users?login=${twitchUser}`
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
    
    let CID = JSON.parse(getChannelID()).users[0]._id
    
    function getChannelSubs(){ 
        let url = `https://api.twitch.tv/kraken/channels/${CID}/subscriptions`
        return httpGet(url,clientID,v5Accept) 
    }
    
    let subs = JSON.parse(getChannelSubs())        
    let subCount = subs._total - 1

    message = `You currently have ${subCount} subscribers on Twitch.\n`

    if (ifCount == true) {
        for (let i = 1; i <= subCount; i++) {
            if (subs.subscriptions[i].is_gift == false) {
                isGift = 'Paid/Prime'
            } else {
                isGift = 'Gift'
            }
            message = message + (`**${subs.subscriptions[i].user.name}** - Tier ${(subs.subscriptions[i].sub_plan / 1000)} - ${isGift}\n`)
        }
    }
    msg.channel.send(message)
}