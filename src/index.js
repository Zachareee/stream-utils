import express from "express"
import { initChatBot } from "./twitch/tmiClient.js"
import { check_state, use_code, tokenEval, generateAuthUrl } from './twitch/TTVauth.js'
import { TTVinfo } from './twitch/TTVutils.js'
import { announce } from './discord/Discordutils.js'
import { renderFile } from "ejs"

const app = express()
const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

app.use(express.static("static"))
app.engine("html", renderFile)
const path = process.cwd()

var client = await initChatBot(server)

app.get("/", async function (req, res) {
  return res.sendFile(path + "/static/index.html")
})

app.get("/chat", async (req, res) => {
  return res.sendFile(path + "/static/chat.html")
})

app.get("/viewers", async (req, res) => {
  return res.sendFile(path + "/static/viewers.html")
})

app.get("/ttv", async (req, res) => {
  return res.render(path + "/static/auth.html", {
    auth: await tokenEval() ? "Authorisation successful" : "Login again",
    authlink: generateAuthUrl(getCallbackURL(req))
  })
})

app.post("/ttv", async (req, res) => {
  res.status(200).send(req.body?.data)
  return announce(await TTVinfo())
})

app.get("/ttv/auth", async (req, res) => {
  const { state, error, code, error_description: desc } = req.query
  if (!check_state(state)) return res.render(path + "/static/authFail.html", { error: "Bad state" })
  if (error) return res.render(path + "/static/authFail.html", { error: `${error} ${desc}` })

  await use_code(code, getCallbackURL(req))

  try {
    client.disconnect()
  } catch (err) {
    console.warn(err)
  }

  client = await initChatBot()

  return res.redirect("/ttv")
})

const getCallbackURL = (req) => `${req.protocol}://${req.hostname}:${PORT}/`

process.on("SIGINT", async () => {
  await client.disconnect().catch(console.warn)
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })

  process.exit()
})