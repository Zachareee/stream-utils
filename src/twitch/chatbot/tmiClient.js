import { Client } from "tmi.js"
import { tokenEval } from "../TTVauth.js"
import { matchCommand } from "./commandUtils.js"
import { io } from "../../index.js"
import { receiveMessage } from "../overlays/chatOverlay.js"
import { getUser } from "../../store.js"

export async function initChatBot() {
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

    client.on("message", async (channel, tags, message, self) => {
        receiveMessage(io, message, tags)

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

    return client
}
