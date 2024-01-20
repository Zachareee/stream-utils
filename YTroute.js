import { refresh, post} from './YTutils.js'
import Parser from 'rss-parser'

const parser = new Parser({
  customFields: {
    item: [
      "published",
      ["yt:videoId", "videoID"]
    ]
  }
})

export function YTroute(app) {
  app.get("/yt", async function(req, res) {
    const { "hub.topic": topic,
      "hub.mode": mode,
      "hub.lease_seconds": lease,
      "hub.challenge": challenge
    } = req.query
  
    if (topic === `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${process.env.YTID}`) {
      if (mode === "subscribe") {
        console.log("Success")
        refresh(lease)
      }
  
      if (mode === "unsubscribe") {
        console.log("Unsubbed")
        refresh(1)
      }
      return res.status(200).send(challenge)
    }
    console.log("Failed")
    return res.status(404).send("Not Found")
  })
  
  app.post("/yt", async function(req, res) {
    if (JSON.stringify(req.body) === '{}') {
      return res.status(400).send("Content empty")
    }
  
    res.sendStatus(200)
    parser.parseString(req.body, (err, content) => {
      if ((content.items).length == 0) return
      const { published, videoID } = content.items[0]
      const currentTime = Date.now()
      const pubTime = new Date(published).getTime()
      console.log(currentTime, pubTime)
      if (currentTime - pubTime <= 300000) post(videoID)
    })
  })
}