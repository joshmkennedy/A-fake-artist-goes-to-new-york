const { words } = require('./words.js')
const { Rooms } = require('./lib/rooms.js')
const rooms = new Rooms()

const userStore = {} ////kv store of userId=>roomName

let activeUserId = 0

//ROLES
const FAKER = 'FAKER'
const QUESTION_MASTER = 'QUESTION_MASTER'
const DEFAULT = 'DEFAULT'

//States
const WAITING = 'WAITING'
const GENERATE_ROLES = 'GENERATE_ROLES'
const PICKING_WORD = 'PICKING_WORD'
const DRAWING_1 = 'DRAWING_1'
const DRAWING_2 = 'DRAWING_2'
const EXPOSE = 'EXPOSE'

exports.onConnect = function (io, socket) {
  const MACHINE = {
    WAITING: {
      on: {
        enter_room: addNewUserToRoom,
        start_game: startGame,
      },
    },
    GENERATE_ROLES: {
      on: {},
      immediate: generateRoles,
    },
    PICKING_WORD: {
      on: {
        category_word_picked: generateWordFromCategory,
        word_generated: beginDrawing,
      },
      immediate: askForCategory,
    },
    DRAWING_1: {
      on: {
        new_lines_added: newLinesAdded,
        end_turn: endTurn,
      },
    },
    DRAWING_2: {
      on: {
        new_lines_added: newLinesAdded,
        end_turn: endTurn,
      },
    },
    EXPOSE: {
      on: {
        votes_submitted: exposeFaker,
      },
      immediate: showVoteForm,
    },
  }

  socket.on('enter_room', (data) => {
    sendEvent('enter_room', { io, socket, data })
  })

  socket.on('start_game', (data) => {
    startGame({ io, socket, data })
  })

  //TODO
  socket.on('category_word_picked', (data) => {
    sendEvent('category_word_picked', { io, socket, data })
  })

  socket.on('end_turn', (data) => {
    sendEvent('end_turn', { io, socket, data })
  })

  socket.on('new_lines_added', (data) => {
    sendEvent('new_lines_added', { io, socket, data })
  })

  //TODO
  socket.on('votes_submitted', (data) => {
    sendEvent('votes_submitted', { io, socket, data })
  })

  socket.on('disconnecting', () => {
    disconnectFromGame({ io, socket })
  })

  function sendEvent(event, { io, socket, data: dataString }) {
    const data = parseData(dataString)
    const { room } = data
    if (room) {
      const [_room] = rooms.findRoom(room)
      const currentState = _room ? _room.state : WAITING

      try {
        MACHINE[currentState].on[event]({ io, socket, data, _room })
      } catch (e) {
        console.log(e)
        console.table({
          currentState,
          event,
          error: e,
        })
      }
    } else {
      console.log('no room was given in the packet')
    }
  }

  function updateRoomState({ io, socket, state: newState, data }) {
    const parsedData = parseData(data)
    const { room } = parsedData
    const roomIndex = rooms._rooms.findIndex((_room) => _room.name === room)
    rooms._rooms[roomIndex].state = newState
    io.to(room).emit('room_state_update', rooms._rooms[roomIndex].state)
    if (MACHINE[newState].immediate) {
      try {
        MACHINE[newState].immediate({ io, socket, data: parsedData })
      } catch (e) {
        console.log(e)
        console.table({
          newState,
          immediate: MACHINE[newState].immediate,
          error: e,
        })
      }
    }
  }

  //STARTS User/ room functions
  function addNewUserToRoom({ io, socket, data }) {
    const { room: roomName, userInformation } = parseData(data)

    let room

    const [_room] = rooms.findRoom(roomName)
    if (!_room) {
      console.log(`couldnt find ${roomName}`, rooms._rooms)
      room = rooms.createRoom({ name: roomName, state: WAITING })
    } else {
      room = _room
    }

    const newUser = room.addUser(userInformation, socket)

    //TODO: Need to run a request to update userCount in room

    socket.join(newUser.room)
    const userList = room.users.map((user) => {
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

    io.to(room.name).emit('new_users', JSON.stringify({ userList }))

    userStore[socket.id] = room.name

    return newUser
  }

  //Starts DRAWING FUNCTIONS

  function startGame({ io, socket, data }) {
    // const { userId, room } = parseData(data)
    updateRoomState({ io, socket, state: GENERATE_ROLES, data })
  }

  function generateRoles({ io, socket, data }) {
    const { room: roomName } = parseData(data)
    const [room] = rooms.findRoom(roomName)
    //get the users in the room
    const users = room.users

    // randomly pick user give QM Role
    selectRole(users, QUESTION_MASTER)
    selectRole(users, FAKER)
    selectRole(users, DEFAULT)

    //send event to notify everyone in room of the Question master
    users.forEach((user) => {
      user.socket.emit(
        'role_chosen',
        JSON.stringify({
          role: user.role,
        })
      )
    })
    const questionMaster = users.find((user) => user.role === 'QUESTION_MASTER')
    //notify everyone of question master
    io.to(roomName).emit(
      'question_master_chosen',
      JSON.stringify({
        user: questionMaster.userId,
      })
    )
    updateRoomState({ io, socket, state: PICKING_WORD, data })
  }

  function generateWordFromCategory({ io, socket, data }) {
    const { category, room: roomName } = data

    const pickedWord =
      words[category][Math.floor(Math.random() * words[category].length)]
    const [room] = rooms.findRoom(roomName)

    room.category = category
    room.pickedWord = pickedWord
    io.to(roomName).emit(
      'category_picked',
      JSON.stringify({
        category,
      })
    )
    room.users.forEach((user) => {
      const message =
        user.role === DEFAULT ? { pickedWord } : { pickedWord: 'unknown' }
      user.socket.emit('category', JSON.stringify(message))
    })
    sendEvent('word_generated', { io, socket, data })
  }

  function beginDrawing({ io, socket, data }) {
    const { room: roomName } = parseData(data)
    updateRoomState({ io, socket, state: DRAWING_1, data })
    const newActiveUser = chooseUserToDraw(roomName, 1)
    notifyRoomActiveUser(io, roomName, newActiveUser)
  }

  //TODO:
  function askForCategory({ data }) {
    const { room } = parseData(data)
    const questionMaster = getQuestionMaster(room)

    questionMaster.socket.emit(
      'ask_for_category',
      JSON.stringify({
        categories: ['food', 'weather', 'animals'],
      })
    )
  }

  function endTurn({ io, socket, data, _room }) {
    const { room: roomName } = data

    const [room] = rooms.findRoom(roomName)

    const activeUser = room.getActiveUser()
    const usersTurnsTaken = activeUser.turnsTaken + 1
    activeUser.turnsTaken = usersTurnsTaken

    const everyoneHasGone =
      room.users.filter((user) => user.turnsTaken !== usersTurnsTaken)
        .length === 1

    if (everyoneHasGone) {
      const currentState = _room.state
      if (currentState === DRAWING_2) {
        updateRoomState({ io, socket, state: EXPOSE, data })
        return
      }

      const firstUser = room.users[0].userId
      room.setActiveUser(firstUser)

      updateRoomState({ io, socket, state: DRAWING_2, data })
      notifyRoomActiveUser(io, roomName, room.users[0])
      console.log('back to start')
    } else {
      const activeUserIndex = room.users.findIndex(
        (user) => user.userId === activeUser.userId && user.role
      )
      const newActiveUser =
        room.users[activeUserIndex + 1].role !== QUESTION_MASTER
          ? room.users[activeUserIndex + 1]
          : room.users[activeUserIndex + 2]
      room.setActiveUser(newActiveUser.userId)

      notifyRoomActiveUser(io, roomName, newActiveUser)
    }
  }

  function showVoteForm({ io, data }) {
    const { room: roomName } = parseData(data)
    const [room] = rooms.findRoom(roomName)
    //Notify all players (not question master) to vote who is the faker

    const players = room.users.filter((user) => user.role !== 'QUESTION_MASTER')
    io.to(room).emit(
      'vote_on_faker',
      JSON.stringify({
        players,
      })
    )
  }
  //TODO:
  function exposeFaker({ io, socket, data }) {
    const { room, usersVotes } = parseData(data)
    console.log(room, usersVotes, io, socket)
    //talley up votes for each user

    //check if user with role faker had most

    //if faker had most send faker lost and all votes for each user

    //else send faker won and all votes for each user

    // ask to play again
  }

  function newLinesAdded({ socket, data }) {
    const { userId, room: roomName } = parseData(data)

    const [room] = rooms.findRoom(roomName)
    if (userId === room.activeUserId) {
      socket.to(roomName).emit('new_lines_added', JSON.stringify(data))
    } else {
      console.log('new lines added', userId, activeUserId)
    }
  }

  function disconnectFromGame({ socket }) {
    const userId = socket.id
    const roomName = userStore[userId]
    const [room] = rooms.findRoom(roomName)
    if (!room) return

    const userIdIndex = room.users?.findIndex(
      (user) => user.userId === socket.id
    )
    console.log(room)
    if (userIdIndex !== -1) {
      room.count -= 1
      if (room.count === 0) {
        const roomIndex = rooms._rooms.findIndex(
          (_room) => _room.name === room.name
        )
        rooms._rooms.splice(roomIndex, 1)
      }
      room.users.splice(userIdIndex, 1)
    }
    delete userStore[userId]
  }

  //helpers
  function parseData(data) {
    return typeof data === 'string' ? JSON.parse(data) : data
  }

  function selectRole(users, role) {
    const usersWithOutRoles = users.filter((user) => user.role === null)
    if (role !== DEFAULT) {
      const count = usersWithOutRoles.length - 1
      const index = Math.abs(Math.round(Math.random() * count))
      const userId = usersWithOutRoles[index].userId
      const user = users.find((user) => user.userId === userId)
      user.role = role
    } else {
      usersWithOutRoles.forEach(({ userId: userIdInRoom }) => {
        const user = users.find((user) => user.userId === userIdInRoom)
        user.role = role
      })
    }
  }

  function getQuestionMaster(roomName) {
    const [room] = rooms.findRoom(roomName)
    const questionMaster = room.users.find(
      (user) => user.role === 'QUESTION_MASTER'
    )
    return questionMaster
  }

  function chooseUserToDraw(roomName, turn) {
    const [room] = rooms.findRoom(roomName)
    const players = room.users.filter((user) => user.role !== 'QUESTION_MASTER')

    const newActiveUser = room.users.find(
      (user) => user.userId === players[0].userId
    )
    room.setActiveUser(newActiveUser.userId)
    return newActiveUser
  }

  function notifyRoomActiveUser(io, room, activeUser) {
    io.to(room).emit(
      'set_active_user',
      JSON.stringify({
        activeUserId: activeUser.userId,
      })
    )
  }
}
