import fetch from 'node-fetch'

const { TTVrole, TTVchannel, Discordwebhook, firebase, DISC_ID, DISC_TOKEN } = process.env

export function send(result) {
  const payload = result ? success(result) : failure()
  return fetch(Discordwebhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
}

export async function DM(message) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bot ${DISC_TOKEN}`
  }

  fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({recipient_id: DISC_ID})
  }).then(async result => {
    const { id } = await result.json()
    fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({content: message})
    })
  })
}

function success(result) {
  return {
    "content": `redynotredy is now live! <@&${TTVrole}>`,
    "embeds": [{
      "title": result.title,
      "url": "https://twitch.tv/redynotredy",
      "description": "We live",
      "thumbnail": {
        "url": result.art
      },
      "image": {
        "url": getResource("thumbnail.png")
      },
      "author": {
        "name": "Stream announcement",
        "url": "https://twitch.tv/redynotredy",
        "icon_url": getResource("twitch.png")
      },
      "color": 16711680,
      "fields": [{
        "name": "Now streaming:",
        "value": result.game,
        "inline": true
      }, {
        "name": "Started:",
        "value": `<t:${(parseInt(Date.now()) / 1000) ^ 0}:R>`,
        "inline": true
      }]
    }, {
      "title": "Missed a stream?",
      "url": `https://www.youtube.com/channel/${TTVchannel}`,
      "description": "Catch it here on my second channel!",
      "thumbnail": {
        "url": getResource("inverted.png")
      },
      "author": {
        "name": "notredynot",
        "url": `https://www.youtube.com/channel/${TTVchannel}`,
        "icon_url": getResource("silver.png")
      },
      "color": 65280
    }]
  }
}

function failure() {
  return {
      content: `Something went wrong, either way redynotredy is live! <@&${TTVrole}>`
  }
}  

function getResource(name) {
  return `${firebase}/${name}?alt=media`
}