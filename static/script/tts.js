const synth = window.speechSynthesis
const speech = new SpeechSynthesisUtterance()

const inputTxt = document.querySelector("input")

loadVoices = () => speech.voice = synth.getVoices()[3]

// in Google Chrome the voices are not ready on page load
if ("onvoiceschanged" in synth) {
  synth.onvoiceschanged = loadVoices
} else {
  loadVoices()
}

function onClick() {
  speech.text = inputTxt.value
  synth.speak(speech)
  inputTxt.blur()
}