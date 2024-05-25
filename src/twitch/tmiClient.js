import { Client } from "tmi.js"
import { Server } from "socket.io";
import { tokenEval } from "./TTVauth.js"
import { chatRoom, listenChat } from "./visual/chatWindow.js"
import { listenViewers, onConnectViewers, viewerRoom } from "./visual/viewerWindow.js"
import { getUser } from "../store.js"

export async function initChatBot(server) {
    const io = ioSetup(server)
    const token = await tokenEval()

    const client = Client({
        options: { debug: true },
        connection: {
            maxReconnectAttempts: 3
        },
        identity: {
            username: getUser(),
            password: `oauth:${token}`
        },
        channels: ['redynotredy']
    })

    client.connect().catch(data => console.warn(data, "for client"))

    listenChat(client, io)
    listenViewers(client, io)

    return client
}

function ioSetup(server) {
    const io = new Server(server)

    io.on("connect", socket => {
        socket.join([chatRoom, viewerRoom])
        onConnectViewers(socket)
    })

    io.of("/").on("join", () => {
        console.log("Connected")
    })

    io.of("/").on("leave", () => {
        console.log("Left")
    })

    return io
}
