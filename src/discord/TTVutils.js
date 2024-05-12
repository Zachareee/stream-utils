import { randomBytes } from "crypto";
import fetch from "node-fetch";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const db = new Low(new JSONFile("./TTVdb.json"), {});
db.read();

const { callback, TTVclientID, TTVclientS, TTVchannel } = process.env

export function gen_state() {
  const buffer = randomBytes(20);
  const state = buffer.toString("hex");
  return Memory.setState(state)
}

export async function check_state(test) {
  return Memory.getState() === test;
}

export async function use_code(code) {
  const body =
    `client_id=${TTVclientID}&` +
    `client_secret=${TTVclientS}&` +
    `code=${code}&` +
    `grant_type=authorization_code&` +
    `redirect_uri=${callback}ttv/auth`;
  const result = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  saveToken(await result.json());
}

export async function TTVinfo() {
  const token = await tokenEval();
  if (!token) return null;

  const options = {
    method: "GET",
    headers: {
      "Client-Id": TTVclientID,
      Authorization: token,
    },
  };
  const currentinfo = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${TTVchannel}`, options)
    .then(result => result.json());
  const { title, game_name: game, game_id: ID } = currentinfo.data[0];

  const artjson = await fetch(`https://api.twitch.tv/helix/games?id=${ID}`, options)
    .then(result => result.json())
  const { box_art_url: art } = artjson.data[0];
  return {
    title, game, art: `${art.split("-{width}x{height}")[0]}.jpg`,
  };
}

export async function tokenEval() {
  const { token } = db.data
  const result = await fetch("https://id.twitch.tv/oauth2/validate", {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });
  console.log(await result.json());

  if (result.status == 200) {
    return token;
  }

  return await refreshToken();
}

function saveToken(res) {
  db.update(data => {
    data.token = `Bearer ${res.access_token}`
    data.refresh = res.refresh_token
  })
}

async function refreshToken() {
  const { refresh } = db.data
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
    if (refresh)
      db.update(data => data.refresh = null)
    return null
  }
  const obj = await result.json()
  saveToken(obj);
  return `Bearer ${obj.access_token}`
}

export class Memory {
  static setState(state) {
    this.state = state
    return state
  }

  static getState() {
    return this.state
  }

  static setErr(error) {
    this.error = error;
    return error
  }

  static getErr() {
    return this.error;
  }
}
