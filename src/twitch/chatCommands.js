import Memory from "../Memory.js"

const commands = [
    {
        regex: /help/,
        lastUsed: 0,
        cooldown: 10000,
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

export function matchCommand(message, bool) {
    for (const idx in commands) {
        const command = commands[idx]
        if (message.match(command.regex)) {
            if (bool) return command
            return updateCD(command)
        }
    }
}

function updateCD(command) {
    if (Date.now() - command.lastUsed <= command.cooldown) return console.log(`${command} skipped`)
    command.lastUsed = Date.now()
    return command
}

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
    return client.say(channel, displayHelp(arr))
}

function displayHelp(arr) {
    if (!arr) arr = commands

    const reply = []
    for (const text of arr) {
        const command = matchCommand(text, true)
        if (command) {
            const { title, details, usage } = command
            reply.push(title, details, `Examples: ${usage.join()}`)
        }
    }

    return reply
}
