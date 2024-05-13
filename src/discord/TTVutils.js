import { tokenEval } from "../TTVauth"

const { TTVclientID, TTVchannel } = process.env

export async function TTVinfo() {
    const token = await tokenEval()
    if (!token) return null

    const options = {
        headers: {
            "Client-Id": TTVclientID,
            Authorization: `Bearer ${token}`
        }
    }

    const { title, game_name: game, game_id: ID } = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${TTVchannel}`, options)
        .then(result => result.json()).then(info => info.data[0])

    const { box_art_url: art } = await fetch(`https://api.twitch.tv/helix/games?id=${ID}`, options)
        .then(result => result.json()).then(info => info.data[0])

    return {
        title, game, art: `${art.split("-{width}x{height}")[0]}.jpg`,
    }
}
