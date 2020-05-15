const rooms = []
const users = []
let activeUserId = 0

function createRoom(rooms) {
  const newRoomName = 'new-room'
  rooms.push(newRoomName)
  return
}
const WAITING = 'WAITING'
const DRAWING_1 = 'DRAWING_1'
const DRAWING_2 = 'DRAWING_2'
const EXPOSE = 'EXPOSE'

const MACHINE = {
  WAITING: {
    on: {},
  },
  DRAWING_1: {
    on: {
      end_turn: endTurn,
    },
  },
  DRAWING_2: {
    on: {
      end_turn: endTurn,
    },
  },
  EXPOSE: {
    on: {},
  },
}

exports.onConnect = function (io, socket) {
  socket.on('enter_room', (data) => {
    addNewUserToRoom(io, socket, data)
  })

  socket.on('start_game', (data) => {
    startGame(io, socket, data)
  })

  socket.on('end_turn', (data) => {
    sendEvent('end_turn', data)
  })

  socket.on('new_lines_added', (data) => {
    newLinesAdded(io, socket, data)
  })

  socket.on('disconnecting', () => {
    disconnectFromGame(io, socket)
  })

  function sendEvent(event, _data) {
    const data = JSON.parse(_data)
    const { room } = data
    if (room) {
      const [_room] = findRoom(room)
      const currentState = _room.state
      console.log(currentState, _room)
      try {
        MACHINE[currentState].on[event](io, socket, data, _room)
      } catch (e) {
        console.log(e)
      }
    } else {
      console.log('no room was given in the packet')
    }
  }
}

function addNewUserToRoom(io, socket, data) {
  const { room, userInformation } = JSON.parse(data)
  const newUser = {
    socket,
    userId: socket.id,
    userName: userInformation.userName,
    room,
  }
  const _room = rooms.find((_room) => _room.name === room)
  if (!_room) {
    rooms.push({ name: room, count: 1, state: WAITING })
  } else {
    _room.count += 1
  }
  console.log(rooms)
  //TODO: Need to run a request to update userCount in room
  users.push(newUser)
  socket.join(newUser.room)
  const userList = users
    .filter((user) => user.room === newUser.room)
    .map((user) => {
      return { id: user.userId, name: user.userName }
    })
  const state = _room ? _room.state : WAITING
  socket.emit(
    'start',
    JSON.stringify({
      newUser: { userId: newUser.userId, userName: newUser.userName },
      state,
    })
  )

  io.to(newUser.room).emit('new_users', JSON.stringify({ userList }))
  console.log(JSON.stringify({ userList }))
  return newUser
}

//Starts DRAWING FUNCTIONS

function startGame(io, socket, data) {
  const { userId, room } = JSON.parse(data)

  updateRoomState(io, DRAWING_1, room)

  activeUserId = userId
  console.log(activeUserId)
  io.to(room).emit(
    'set_active_user',
    JSON.stringify({
      activeUserId: activeUserId,
    })
  )
  console.log(rooms)
}

function endTurn(io, socket, data, _room) {
  const { room: roomName } = data

  io.to(roomName).emit(
    'turn_ended',
    JSON.stringify({ activeUserId: activeUserId })
  )

  //TODO: deal with who is the QM that will effect who's turn it is because QM is skipped

  const activeUserIdIndex = users.findIndex((user) => {
    return user.userId === activeUserId
  })

  if (activeUserIdIndex >= users.length - 1) {
    const currentState = _room.state
    if (currentState === DRAWING_2) {
      updateRoomState(io, EXPOSE, roomName)
      return
    }
    updateRoomState(io, DRAWING_2, roomName)

    const newActiveUser = users[0].userId
    activeUserId = newActiveUser

    io.to(roomName).emit(
      'set_active_user',
      JSON.stringify({ activeUserId: activeUserId })
    )
    console.log('back to start')
  } else {
    const newActiveUser = users[activeUserIdIndex + 1].userId
    activeUserId = newActiveUser
    console.log(activeUserId)
    io.to(roomName).emit(
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
    socket.to(room).emit('new_lines_added', data)
  } else {
    console.log('new lines added', userId, activeUserId)
  }
}

function disconnectFromGame(io, socket) {
  const userIdIndex = users.findIndex((user) => user.userId === socket.id)
  if (userIdIndex !== -1) {
    const room = users[userIdIndex].room
    const [_room, roomIndex] = findRoom(room)
    _room.count -= 1
    if (_room.count === 0) {
      rooms.splice(roomIndex, 1)
    }
    users.splice(userIdIndex, 1)
  }
}
//helpers
function findRoom(room) {
  const _roomIndex = rooms.findIndex((_room) => _room.name === room)
  return [rooms[_roomIndex], _roomIndex]
}

function updateRoomState(io, newState, room) {
  const roomIndex = rooms.findIndex((_room) => _room.name === room)
  rooms[roomIndex].state = newState
  io.to(room).emit('room_state_update', rooms[roomIndex].state)
}

function updateDrawingRound(room) {
  localSendEvent('update_drawing_round', { room })
}
