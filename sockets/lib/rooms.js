class Rooms {
  constructor() {
    this._rooms = []
  }
  createRoom = (room) => {
    const newRoom = new Room(room)
    this._rooms.push(newRoom)
    return newRoom
  }
  findRoom = (room) => {
    const _roomIndex = this._rooms.findIndex((_room) => _room.name === room)
    return [this._rooms[_roomIndex], _roomIndex]
  }
}

class Room {
  constructor({ name, count = 0, state = 'WAITING', users = [] }) {
    this.name = name
    this.count = count
    this.state = state
    this.users = users
  }

  addUser(userInformation, socket) {
    const newUser = new User(this.name, userInformation, socket)
    this.users.push(newUser)
    this.count = this.users.length
    return newUser
  }
  getActiveUser() {
    if (this.activeUserId) {
      return this.users.find((user) => user.userId === this.activeUserId)
    } else {
      return false
    }
  }
  setActiveUser(userId) {
    const user = this.users.find((user) => user.userId === userId)
    this.activeUserId = user.userId
  }
}

class User {
  constructor(room, userInformation, socket) {
    this.socket = socket
    this.userId = socket.id
    this.room = room
    this.userName = userInformation.userName
    this.role = null
    this.turnsTaken = 0
  }
}

exports.Rooms = Rooms
