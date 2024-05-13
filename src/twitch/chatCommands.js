import Memory from "../Memory.js"
import { matchCommand } from "./commandUtils.js"

export const commands = [
    {
        regex: /help/,
        lastUsed: 0,
        cooldown: 1000,
        callback: helpCommand,
        details: {
            title: "Help command",
            description: "Get help with specific commands or list all commands",
            usage: ["$help", "$help COMMAND"]
        }
    },
    {
        regex: /join/,
        lastUsed: 0,
        cooldown: 10000,
        callback: joinCommand,
        details: {
            title: "Join command",
            description: "Get a link to join the current game",
            usage: ["$join"]
        }
    }
]

function joinCommand(channel, tags, message, client) {
    const { "user-id": userId, username, color } = tags
    const link = Memory.getLink()
    console.log(link)
    if (!link) {
        return client.say(channel, `@${username} there are no links available currently`)
    }

    client.whisper(userId, link).then(() => client.say(channel, `@${username} I've sent you the invite link, check your whispers!`))
}

function helpCommand(channel, tags, message, client) {
    const arr = message.split(" ")
    if (arr.length == 1) {
        return client.say(channel, displayHelp())
    }

    arr.shift()
    return client.say(channel, displayHelp(arr).join("\n"))
}

function displayHelp(arr) {
    const reply = []
    if (!arr) {
        for (const command of commands) {
            const { title, description, usage } = command.details
            reply.push(title, description, `Examples: ${usage.join()}`)
        }

        return reply
    }

    for (const text of arr) {
        const command = matchCommand(text, true)
        if (command) {
            const { title, description, usage } = command
            reply.push(title, description, `Examples: ${usage.join()}`)
        }
    }

    return reply
}
