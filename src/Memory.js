import { DM } from "./discord/Discordutils.js"

export default class Memory {
  static setState(state) {
    this.state = state
    return state
  }

  static getState() {
    return this.state
  }

  static addLink(link) {
    if (!this.arr) {
      this.arr = [link]
      return 1
    }

    const len = this.arr.unshift(link)
    return len
  }

  static getLink() {
    if (!this.arr || this.arr.length == 0) {
      DM("Please refill links")
      return null
    }

    const link = this.arr.pop()
    return link
  }
}
