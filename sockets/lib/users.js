class User {
  constructor(room, userInformation, socket) {
    this.socket = socket
    this.userId = socket.id
    this.room = room
    this.userName = userInformation.userName
    this.role = null
  }
}
exports.User = User
