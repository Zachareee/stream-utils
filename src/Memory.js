export default class Memory {
  static setState(state) {
    this.state = state
    return state
  }

  static getState() {
    return this.state
  }

  static setErr(error) {
    this.error = error;
    return error
  }

  static getErr() {
    return this.error;
  }
}
