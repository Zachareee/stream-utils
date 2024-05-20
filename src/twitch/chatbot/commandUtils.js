import { commands } from "./chatCommands.js"

export function matchCommand(message, skip) {
    for (const command of commands) {
        if (message.match(command.regex)) {
            if (skip) return command
            return updateCD(command)
        }
    }

    throw new Error("No command found")
}

function updateCD(command) {
    if (Date.now() - command.lastUsed <= command.cooldown) return console.log(`${command} skipped`)
    command.lastUsed = Date.now()
    return command
}
