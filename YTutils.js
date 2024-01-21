import { createHmac, timingSafeEqual } from "crypto";
import fetch from "node-fetch";
import { exec } from "child_process";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const db = new Low(new JSONFile("./YTdb.json"), {});

export function verifyYTHash() {
  return (req, res, buf, encoding) => {
    const header = req.header("X-Hub-Signature");
    const signature = header.split("sha1=")[1];
    const sigBuffer = Buffer.from(signature, "hex");
    const hash = createHmac("sha1", process.env.YTsecret).update(buf).digest();
    try {
      if (!timingSafeEqual(hash, sigBuffer)) {
        console.log(
          `${hash.toString("hex")} < hash\nsigBuffer.toString("hex")}`,
        );
        res.status(401).send("Bad request signature");
        throw new Error("Bad request signature");
      }
    } catch (err) {
      console.error(err);
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export async function refresh(leaseSeconds) {
  if (leaseSeconds) {
    db.set("lease", parseInt(leaseSeconds));
    db.set("start", Date.now() / 1000);
    console.log("Returned");
    return;
  }
  const start = await db.get("start");
  const lease = await db.get("lease");
  console.log(start, lease);
  console.log(Date.now() / 1000);
  if (!start || !lease || Date.now() / 1000 > start + lease) subscribe();
}

function subscribe() {
  console.log("Subscribe() called");
  fetch("https://pubsubhubbub.appspot.com/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `hub.topic=https://www.youtube.com/xml/feeds/videos.xml?channel_id=${process.env.YTID}&hub.callback=${process.env.callback}yt&hub.mode=subscribe&hub.secret=${process.env.YTsecret}`,
  });
}

export async function post(ID) {
  const old = await db.get("ID");
  if (ID === old) {
    console.log("Rejected");
    return;
  }

  const body = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `New video uploaded!!! <@&${process.env.YTrole}>\nhttps://www.youtube.com/watch?v=${ID}`,
    }),
  };
  const result = await fetch(process.env.YTwebhook, body);
  if (result.status == 429) {
    db.set("failed", ID);
    exec("kill 1");
  }
  db.set("ID", ID);
  db.delete("failed");
}

export async function check() {
  const ID = await db.get("failed");
  if (ID) post(ID);
}
