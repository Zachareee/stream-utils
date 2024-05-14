const synth = window.speechSynthesis
const speech = new SpeechSynthesisUtterance()
const chat = document.getElementById("chat")
const socket = io()

// in Google Chrome the voices are not ready on page load
synth.onvoiceschanged = () => speech.voice = synth.getVoices()[3]

socket.on("chat", (message, tags) => {
  const { color, "display-name": displayName } = tags

  writeMessage({ color, displayName, message })
  speakMessage(displayName, message)
})

function speakMessage(...args) {
  speech.text = args.join()
  synth.speak(speech)
}

function writeMessage({ message, displayName, color }) {
  const name = document.createElement("span")
  name.style = objectToStyle({ color })
  name.innerHTML = displayName

  const span = document.createElement("span")
  span.innerHTML = ": " + message

  const div = document.createElement("div")
  div.append(name)
  div.append(span)

  chat.append(div)
}

function objectToStyle(obj) {
  return Object.entries(obj).map(([key, value]) => `${key}: ${value};`)
}