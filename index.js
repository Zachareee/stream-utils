import express from 'express'
import { YTroute } from './YTroute.js'
import { TTVroute } from './TTVroute.js'
import { verifyYTHash, refresh, check } from './YTutils.js'
import { verifyTTVHash } from './TTVutils.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static("static"))

app.use(express.raw({ type: "application/atom+xml", verify: verifyYTHash() }))

app.use(express.json({ verify: verifyTTVHash() }))

YTroute(app)
TTVroute(app)

app.get("/", async function(req, res) {
  console.log("Pinged")
  refresh()
  check()
  res.sendFile(process.cwd() + "/public/index.html")
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})