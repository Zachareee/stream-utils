import express from "express";
import { TTVroute } from "./src/discord/TTVroute.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("static"));

TTVroute(app);

app.get("/", async function (req, res) {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.get("/tts", async (req, res) => {
  return res.sendFile(process.cwd() + "/public/tts.html")
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
