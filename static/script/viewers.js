const table = document.querySelector("table")
const count = document.querySelector("#viewercount")
const socket = io()

socket.on("join", user => {
  appendRow(user)
})

socket.on("leave", user => {
  document.querySelector(`#${user}`)?.remove()
  changeCount(-1)
})

socket.emit("request", (arr) => {
  arr.forEach(e => appendRow(e))
})

function appendRow(user) {
  changeCount(1)
  const row = document.createElement("tr")
  row.innerHTML = user
  row.id = user
  table.appendChild(row)
}

function changeCount(num) {
  count.innerHTML = parseInt(count.innerHTML) + num
}