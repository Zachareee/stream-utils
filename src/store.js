import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

const db = new LowSync(new JSONFileSync("./TTVdb.json"), {});

export function getTokens() {
    db.read()
    return db.data
}

export function saveToken(res) {
  db.update(data => {
    data.token = res.access_token
    data.refresh = res.refresh_token
  })
}