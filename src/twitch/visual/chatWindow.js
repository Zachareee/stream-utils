import { matchCommand } from "../chatbot/commandUtils.js"

export const chatRoom = "chatroom"

export function listenChat(client, io) {
    client.on("message", async (channel, tags, message, self) => {
        io.to(chatRoom).emit("chat", message, tags)

        message = message.toLowerCase().trim()
        if (self || !message.startsWith("$")) return

        const { username } = tags
        message = message.substring(1)

        try {
            const command = matchCommand(message)
            if (command)
                return command.callback(channel, tags, message, client)
        } catch {
            client.say(channel, `@${username} Unknown command, try $help for all commands, or $help COMMAND for a specific command`)
        }
    })
}