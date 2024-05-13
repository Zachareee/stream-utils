import { randomBytes } from "crypto"
import fetch from "node-fetch"
import { getTokens, saveToken } from "../store.js"
import Memory from "../Memory.js"
import { DM } from "../discord/Discordutils.js"

const { callback, TTVclientID, TTVclientS } = process.env

export function generateAuthUrl() {
  const scope = ["chat:read", "chat:edit", "user:manage:whispers"]
  const params = {
    client_id: TTVclientID,
    redirect_uri: `${callback}ttv/auth`,
    response_type: "code",
    scope: scope.map(word => encodeURIComponent(word)).join("+"),
    force_verify: false,
    state: gen_state()
  }

  return `https://id.twitch.tv/oauth2/authorize?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&")}`
}

export function gen_state() {
  const buffer = randomBytes(20)
  const state = buffer.toString("hex")
  return Memory.setState(state)
}

export function check_state(test) {
  return Memory.getState() === test
}

export async function use_code(code) {
  const body =
    `client_id=${TTVclientID}&` +
    `client_secret=${TTVclientS}&` +
    `code=${code}&` +
    `grant_type=authorization_code&` +
    `redirect_uri=${callback}ttv/auth`
  const result = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  saveToken(await result.json())
}

export async function tokenEval() {
  const { token } = getTokens()
  const result = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (result.status == 200) {
    return token
  }

  return await refreshToken()
}

async function refreshToken() {
  const { refresh } = getTokens()
  const body =
    `grant_type=refresh_token&` +
    `refresh_token=${refresh}&` +
    `client_id=${TTVclientID}&` +
    `client_secret=${TTVclientS}`
  const result = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  if (result.status == 400) {
    // if (refresh)
    //   db.update(data => data.refresh = null)
    DM("Refresh access token")
    return null
  }

  const obj = await result.json()
  saveToken(obj)
  return `Bearer ${obj.access_token}`
}
