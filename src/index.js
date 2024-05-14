import express from "express"
import { initChatBot } from "./twitch/chatbot/tmiClient.js"
import { check_state, use_code, tokenEval, generateAuthUrl } from './twitch/TTVauth.js'
import { TTVinfo } from './twitch/TTVutils.js'
import { announce } from './discord/Discordutils.js'
import { renderFile } from "ejs"
import { ioSetup } from "./twitch/overlays/chatOverlay.js"

const app = express()
const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

app.use(express.static("static"))
app.engine("html", renderFile)
const path = process.cwd()

export const io = ioSetup(server)
var client = await initChatBot()

app.get("/", async function (req, res) {
  return res.sendFile(path + "/public/index.html")
})

app.get("/tts", async (req, res) => {
  return res.sendFile(path + "/public/tts.html")
})

app.get("/ttv", async (req, res) => {
  return res.render(path + "/public/auth.html", {
    auth: await tokenEval() ? "Authorisation successful" : "Login again",
    authlink: generateAuthUrl()
  })
})

app.post("/ttv", async (req, res) => {
  res.status(200).send(req.body?.data)
  return announce(await TTVinfo())
})

app.get("/ttv/auth", async (req, res) => {
  const { state, error, code, error_description: desc } = req.query
  if (!check_state(state)) return res.render(path + "/public/authFail.html", { error: "Bad state" })
  if (error) return res.render(path + "/public/authFail.html", { error: `${error} ${desc}` })

  await use_code(code)
  if (client.readyState() === "CLOSED")
    client = await initChatBot()

  return res.redirect("/ttv")
})

process.on("SIGINT", async () => {
  await client.disconnect().catch(console.warn)
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit()
  })
})