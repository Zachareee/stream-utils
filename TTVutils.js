import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import fetch from "node-fetch";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const db = new Low(new JSONFile("./TTVdb.json"), {});
db.read();

export function verifyTTVHash() {
  return (req, res, buf, encoding) => {
    const header = req.header("SHA1-Signature");
    const sigBuffer = Buffer.from(header, "hex");
    const hash = createHmac("sha1", process.env.TTVsecret).update(buf).digest();
    try {
      if (!timingSafeEqual(hash, sigBuffer)) {
        throw new Error("Bad request signature");
      }
    } catch (err) {
      console.error(err);
      console.log(`Hash: ${hash.toString("hex")}, signature: ${header}`);
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

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
    `client_id=${process.env.TTVclientID}&` +
    `client_secret=${process.env.TTVclientS}&` +
    `code=${code}&` +
    `grant_type=authorization_code&` +
    `redirect_uri=${process.env.callback}ttv/auth`;
  const result = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });

  saveToken(await result.json());
}

export async function TTVinfo() {
  const token = await tokenEval();
  if (!token) return null;
  const options = {
    method: "GET",
    headers: {
      "Client-Id": process.env.TTVclientID,
      Authorization: token,
    },
  };
  var endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${process.env.TTVchannel}`;
  var result = await fetch(endpoint, options);
  var response = await result.json();
  const { title, game_name: game, game_id: ID } = response.data[0];

  endpoint = `https://api.twitch.tv/helix/games?id=${ID}`;
  result = await fetch(endpoint, options);
  response = await result.json();
  const { box_art_url: art } = response.data[0];
  return { title, game, art: `${art.split("-{width}x{height}")[0]}.jpg`,
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

async function saveToken(data) {
  const { access_token: access = null, refresh_token: refresh = null } = data;
  await db.update(data => {
    data.token = `Bearer ${access}`
    data.refresh = refresh
  })
}

async function refreshToken() {
  const { refresh } = db.data
  const body =
    `grant_type=refresh_token&` +
    `refresh_token=${refresh}&` +
    `client_id=${process.env.TTVclientID}&` +
    `client_secret=${process.env.TTVclientS}`
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
  await saveToken(obj);
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
