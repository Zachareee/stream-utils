import express from "express"
import { initChatBot } from "./twitch/tmiClient.js"
import { gen_state, check_state, use_code, tokenEval } from './twitch/TTVauth.js'
import { TTVinfo } from './twitch/TTVutils.js'
import { announce } from './discord/Discordutils.js'
import Memory from './Memory.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static("static"))
const path = process.cwd()

const client = initChatBot()

app.get("/", async function (req, res) {
  return res.sendFile(path + "/public/index.html")
})

app.get("/tts", async (req, res) => {
  return res.sendFile(path + "/public/tts.html")
})

app.get("/ttv", async (req, res) => {
  return res.sendFile(path + "/public/auth.html")
})

app.post("/ttv", async (req, res) => {
  res.status(200).send(req.body?.data)
  return announce(await TTVinfo())
})

app.get("/ttv/auth", async (req, res) => {
  const { state, error, code, error_description: desc } = req.query
  if (!await check_state(state)) {
    Memory.setErr("Bad state")
    return res.sendFile(path + "/public/authFail.html")
  }
  if (error) {
    Memory.setErr(error + '\n' + desc)
    return res.sendFile(path + "/public/authFail.html")
  }
  use_code(code)
  return res.redirect("/ttv")
})

app.get("/state", async (req, res) => {
  const auth = !!await tokenEval()
  return res.send({ state: gen_state(), auth })
})

app.get("/error", async (req, res) => {
  console.log(Memory.getErr())
  return res.send(Memory.getErr())
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})