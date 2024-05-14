import { Server } from "socket.io";

export function ioSetup(server) {
    const io = new Server(server)

    io.on("connect", socket => {
        socket.join("chatroom")
    })

    io.of("/").on("join", () => {
        console.log("Connected")
    })

    io.of("/").on("leave", () => {
        console.log("Left")
    })

    return io
}

export function receiveMessage(io, message, tags) {
    io.to("chatroom").emit("chat", message, tags)
}