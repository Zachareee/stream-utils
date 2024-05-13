import { Client } from "tmi.js"
import { tokenEval } from "./TTVauth.js"
import { matchCommand } from "./chatCommands.js"

export function initChatBot() {
    const { token } = tokenEval()

    const client = Client({
        options: { debug: true },
        identity: {
            username: 'notredynot',
            password: `oauth:${token}`
        },
        channels: ['redynotredy']
    })

    client.connect().catch(data => console.warn(data, "for client"))

    client.on("message", async (channel, tags, message, self) => {
        if (self) return
        const { username } = tags

        message = message.toLowerCase().trim()
        if (message.startsWith("$")) {
            message = message.substring(1)
            const command = matchCommand(message)
            if (command)
                command.callback(channel, tags, message, client)

            client.say(channel, `@${username} Unknown command, try $help for all commands, or $help COMMAND for a specific command`)
        }
    })

    return client
}
