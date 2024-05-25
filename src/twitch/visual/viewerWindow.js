export const viewerRoom = "viewerroom"

const viewers = []

export function listenViewers(client, io) {
    client.on("join", (channel, username) => {
        viewers.push(username)
        sendEvent(io, "join", username)
    })

    client.on("part", (channel, username) => {
        const idx = viewers.indexOf(username)
        if (idx !== -1) viewers.splice(idx, 1)
        sendEvent(io, "leave", username)
    })
}

export function onConnectViewers(socket) {
    socket.on("request", fn => {
        fn(viewers)
    })
}

function sendEvent(io, event, name) {
    io.to(viewerRoom).emit(event, name)
}