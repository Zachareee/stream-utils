const table = document.querySelector("table")
const socket = io()

socket.on("join", user => {
  appendRow(user)
})

socket.on("leave", user => {
  document.querySelector(`#${user}`)?.remove()
})

socket.emit("request", (arr) => {
  arr.forEach(e => appendRow(e))
})

function appendRow(user) {
  const row = document.createElement("tr")
  row.innerHTML = user
  row.id = user
  table.appendChild(row)
}