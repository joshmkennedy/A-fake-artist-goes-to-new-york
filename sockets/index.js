const http = require('http')

const express = require('express')
const socketIo = require('socket.io')

const port = process.env.PORT || 4001

const app = express()
app.get('/', function (req, res) {
  res.send({ response: 'I am alive' }).status(200)
})

const server = http.createServer(app)

const io = socketIo(server) // < Interesting!

const users = []
let activeUserId = 0

function _sendDataToInActiveUsers(event, data, socket) {
  users.forEach((user) => {
    if (user.userId !== activeUserId) {
      socket.emit(event, JSON.stringify(data))
    }
  })
}

function generateUserId() {
  const randomNumber = Math.floor(Math.random() * 100)

  if (users.findIndex((user) => user.userId === randomNumber) === -1) {
    return randomNumber
  } else {
    generateUserId()
  }
}

io.on('connection', (socket) => {
  const sendDataToInActiveUsers = (event, data) =>
    _sendDataToInActiveUsers(event, data, socket)

  const newUserId = generateUserId()
  users.push({ socket, userId: newUserId })
  socket.emit('start', JSON.stringify({ userId: newUserId }))

  const userIds = users.map((user) => user.userId)
  io.emit('new_users', JSON.stringify({ userIds }))
  //DRAWING FUNCTIONS
  socket.on('start_game', (data) => {
    const { userId } = JSON.parse(data)
    let activeUserId = userId
    io.emit(
      'set_active_user',
      JSON.stringify({
        activeUserId,
      })
    )
  })
  socket.on('active_user_mousemove', (data) => {
    const { userId } = JSON.parse(data)
    if (userId === activeUserId) {
      sendDataToInActiveUsers('active_user_mousemove', data)
    }
  })
  socket.on('drawing', (data) => {
    const { userId } = JSON.parse(data)
    if (userId === activeUserId) {
      sendDataToInActiveUsers('drawing', data)
    }
  })
  socket.on('drawingStopped', (data) => {
    sendDataToInActiveUsers('drawingStopped', data)
    const activeUserIdIndex = users.findIndex((user) => {
      console.log(user.userId, activeUserId)
      return user.userId === activeUserId
    })
    console.log(activeUserIdIndex)
    if (activeUserIdIndex >= users.length - 1) {
      const newActiveUser = users[0].userId
      activeUserId = newActiveUser
      io.emit('set_active_user', JSON.stringify({ activeUserId }))
      console.log('back to start')
    } else {
      const newActiveUser = users[activeUserIdIndex + 1].userId
      activeUserId = newActiveUser
      io.emit('set_active_user', JSON.stringify({ activeUserId }))
      console.log('+1')
    }
  })

  socket.on('disconnecting', (data) => {
    console.log(data)
    const userIdIndex = users.findIndex((user) => user.socket === socket)
    users.splice(userIdIndex, 1)
  })
})

server.listen(port, () => {
  console.log(`listening on *:${port}`)
})
