const http = require('http')

const express = require('express')
const socketIo = require('socket.io')

const { onConnect } = require('./gameEvents')

const port = process.env.PORT || 4001

const app = express()
app.get('/', function (req, res) {
  res.send({ response: 'I am alive' }).status(200)
})

const server = http.createServer(app)

//app state
const io = socketIo(server)

io.on('connection', (socket) => {
  onConnect(io, socket)
})

server.listen(port, () => {
  console.log(`listening on *:${port}`)
})
