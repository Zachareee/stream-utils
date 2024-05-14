import Memory from "../../Memory.js"
import { matchCommand } from "./commandUtils.js"

export const commands = [
    {
        regex: /help/,
        lastUsed: 0,
        cooldown: 600000,
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
    const reply = []
    if (arr.length == 1)
        displayHelp(reply)
    else {
        arr.shift()
        displayHelp(reply, arr)
    }

    for (const str of reply)
        client.say(channel, str)
}

function displayHelp(reply, arr) {
    if (!arr) {
        for (const command of commands)
            appendCommands(reply, command)

        return reply
    }

    for (const text of arr) {
        const command = matchCommand(text, true)
        if (command)
            appendCommands(reply, command)
    }

    return reply
}

function appendCommands(arr, command) {
    const { title, description, usage } = command.details
    arr.push(`${title}: ${description}. Examples: ${usage.join()}`)
}
