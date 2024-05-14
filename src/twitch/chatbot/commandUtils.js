import { commands } from "./chatCommands.js"

export function matchCommand(message, bool) {
    for (const command of commands) {
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
