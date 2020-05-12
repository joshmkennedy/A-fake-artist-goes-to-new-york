const rooms = []
const users = []
let activeUserId = 0

function createRoom(rooms) {
  const newRoomName = 'new-room'
  rooms.push(newRoomName)
  return
}

exports.onConnect = function (io, socket) {
  if (users.length === 0) {
    createRoom(rooms)
  }

  addNewUserToRoom(io, socket)

  socket.on('start_game', (data) => {
    startGame(io, socket, data)
  })

  socket.on('end_turn', (data) => {
    endTurn(io, socket, data)
  })

  socket.on('new_lines_added', (data) => {
    newLinesAdded(io, socket, data)
  })

  socket.on('disconnecting', (data) => {
    disconnectFromGame(io, socket, data)
  })
}

function addNewUserToRoom(io, socket) {
  //TODO need to connect to the database and get some information from user to see what room to place them
  const newUser = { socket, userId: socket.id, room: rooms[0] }
  users.push(newUser)
  socket.join(newUser.room)
  const userIds = users
    .filter((user) => user.room === newUser.room)
    .map((user) => user.userId)
  socket.emit(
    'start',
    JSON.stringify({ userId: socket.id, room: newUser.room })
  )
  io.to(newUser.room).emit('new_users', JSON.stringify({ userIds }))
  return newUser
}

//Starts DRAWING FUNCTIONS

function startGame(io, socket, data) {
  const { userId, room } = JSON.parse(data)
  activeUserId = userId
  console.log(activeUserId)
  io.to(room).emit(
    'set_active_user',
    JSON.stringify({
      activeUserId: activeUserId,
    })
  )
}

function endTurn(io, socket, data) {
  const { room } = JSON.parse(data)
  console.log('room', room)
  io.to(room).emit('turn_ended', JSON.stringify({ activeUserId: activeUserId }))
  const activeUserIdIndex = users.findIndex((user) => {
    return user.userId === activeUserId
  })

  if (activeUserIdIndex >= users.length - 1) {
    const newActiveUser = users[0].userId
    activeUserId = newActiveUser

    io.to(room).emit(
      'set_active_user',
      JSON.stringify({ activeUserId: activeUserId })
    )
    console.log('back to start')
  } else {
    const newActiveUser = users[activeUserIdIndex + 1].userId
    activeUserId = newActiveUser
    console.log(activeUserId)
    io.to(room).emit(
      'set_active_user',
      JSON.stringify({ activeUserId: newActiveUser })
    )
    console.log('+1')
  }
}

function newLinesAdded(io, socket, data) {
  const { userId, room } = JSON.parse(data)
  if (userId === activeUserId) {
    console.log(userId, activeUserId)
    socket.to('new-room').emit('new_lines_added', data)
  } else {
    console.log('new lines added', userId, activeUserId)
  }
}

function disconnectFromGame(io, socket, data) {
  console.log(data)
  const userIdIndex = users.findIndex((user) => user.socket === socket)
  users.splice(userIdIndex, 1)
}
