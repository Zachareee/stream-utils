import { gen_state, check_state, use_code, TTVinfo, tokenEval, Memory } from './TTVutils.js'
import { send, sendError } from './Discordutils.js'

const path = process.cwd()

export function TTVroute(app) {
  app.get("/ttv", async (req, res) => {
    res.sendFile(path + "/public/auth.html")
  })

  app.post("/ttv", async (req, res) => {
    if (JSON.stringify(req.body) === '{}') {
      return res.status(401).send("Content empty")
    }

    res.status(200).send(req.body.data)
    const obj = await TTVinfo()
    return obj ? send(obj) : sendError()
  })

  app.get("/ttv/auth", async (req, res) => {
    const { state, error, code, error_description: desc } = req.query
    if (!await check_state(state)) {
      Memory.setErr("Bad state")
      return res.status(200).sendFile(path + "/public/authFail.html")
    }
    if (error) {
      Memory.setErr(error + '\n' + desc)
      return res.status(200).sendFile(path + "/public/authFail.html")
    }
    await use_code(code)
    res.redirect("/ttv")
  })

  app.get("/state", async (req, res) => {
    const auth = !!await tokenEval()
    return res.send({ state: gen_state(), auth })
  })

  app.get("/error", async (req, res) => {
    console.log(Memory.getErr())
    res.send(Memory.getErr())
  })
}