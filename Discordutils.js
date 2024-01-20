import fetch from 'node-fetch'

const callback = process.env.callback

export async function send(result) {
  const payload = {
    "content": `redynotredy is now live! <@&${process.env.TTVrole}>`,
    "embeds": [{
      "title": result.title,
      "url": "https://twitch.tv/redynotredy",
      "description": "We live",
      "thumbnail": {
        "url": result.art
      },
      "image": {
        "url": `${callback}media/thumbnail.png`
      },
      "author": {
        "name": "Stream announcement",
        "url": "https://twitch.tv/redynotredy",
        "icon_url": `${callback}media/twitch.png`
      },
      "color": 16711680,
      "fields": [{
        "name": "Now streaming:",
        "value": result.game,
        "inline": true
      }, {
        "name": "Started:",
        "value": `<t:${(parseInt(Date.now())/1000) ^ 0}:R>`,
        "inline": true
      }]
    }, {
      "title": "Missed a stream?",
      "url": `https://www.youtube.com/channel/${process.env.TTVchannel}`,
      "description": "Catch it here on my second channel!",
      "thumbnail": {
        "url": `${callback}media/inverted.png`
      },
      "author": {
        "name": "notredynot",
        "url": `https://www.youtube.com/channel/${process.env.TTVchannel}`,
        "icon_url": `${callback}media/silver.png`
      },
      "color": 65280
    }]
  }

  const response = await fetch(process.env.Discordwebhook, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  console.log(await response.text())
}

export async function sendError() {
  fetch(process.env.Discordwebhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: `Something went wrong, nevertheless redynotredy is live! <@&${process.env.TTVrole}>`
    })
  })
}