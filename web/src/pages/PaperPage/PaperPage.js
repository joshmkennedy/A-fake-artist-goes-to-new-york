import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash'

import MainLayout from 'src/layouts/MainLayout/MainLayout'

import { useIsRoomOwner, useConnectSocket, useRoomState } from './hooks'
const ENDPOINT = 'http://127.0.0.1:4001'

const PaperPage = ({ roomId }) => {
  //USERS
  const [userInformation, setUserInformation] = useState({
    userId: '',
    userName: 'Josh Kennedy',
  })
  const { isOwner } = useIsRoomOwner(roomId)
  const [allUsers, setAllUsers] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  useEffect(() => {
    if (socket) {
      console.log('connected')
      socket.on('start', (data) => {
        const { newUser, state } = JSON.parse(data)
        setRoomState(state)
        setUserInformation(newUser)
        setInRoom(true)
      })

      socket.on('new_users', (data) => {
        const { userList } = JSON.parse(data)
        setAllUsers([...userList])
      })

      socket.on('set_active_user', (data) => {
        const { activeUserId } = JSON.parse(data)
        setActiveUser(activeUserId)
      })
    }
    return () => {
      //need to know the userInformation and room thats why its in the user section
      if (socket) {
        socket.emit('disconnecting')
        console.log('disconnected')
        setInRoom(false)
      }
    }
  }, [socket])

  //Room/Game State
  const { socket, enterRoom } = useConnectSocket(ENDPOINT, {
    room: roomId,
    userInformation,
  })
  const [inRoom, setInRoom] = useState(false)
  const { roomState, setRoomState } = useRoomState(socket)

  function endTurn(e) {
    if (!socket) return
    socket.emit('end_turn', JSON.stringify({ room: roomId }))
  }
  function startGame() {
    if (socket) {
      socket.emit(
        'start_game',
        JSON.stringify({
          userId: userInformation.userId,
          room: roomId,
        })
      )
    }
  }

  return (
    <MainLayout>
      <h1>{roomId}</h1>

      {inRoom && isOwner && <button onClick={startGame}>Start Game</button>}
      {!inRoom && <button onClick={enterRoom}>enter Game</button>}

      {userInformation.userId === activeUser && (
        <button onClick={endTurn}>End Turn</button>
      )}
      <ul style={{ display: `flex` }}>
        {allUsers.map((user) => (
          <li
            style={{
              backgroundColor: user.id === activeUser ? `blue` : `white`,
            }}
            key={user.id}
          >
            {user.name}
          </li>
        ))}
      </ul>
      <h3>{roomState}</h3>
      <Paper
        {...{
          room: roomId,
          socket,
          userInformation,
          activeUser,
        }}
      />
    </MainLayout>
  )
}

export default PaperPage

const DrawingLine = ({ line }) => {
  const pathData = `M ${line.map((p) => `${p.x} ${p.y}`).join(' L ')}`
  return (
    <path
      d={pathData}
      stroke={`black`}
      fill={`none`}
      strokeWidth={`20px`}
    ></path>
  )
}
const Paper = ({
  socket,

  activeUser,
  userInformation,
  room,
}) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const drawingArea = useRef()
  const [lines, setLines] = useState([])
  const submitlines = (socket, userInformation, lines, room) => {
    if (socket) {
      socket.emit(
        'new_lines_added',
        JSON.stringify({ lines, userId: userInformation.userId, room })
      )
    }
  }
  const fn = useRef(_.throttle(submitlines, 100)).current
  useEffect(() => {
    if (socket && activeUser === userInformation.userId) {
      fn(socket, userInformation, lines, room)
    }
  }, [lines, fn, socket, userInformation, activeUser, room])

  useEffect(() => {
    if (!socket) return
    socket.on('new_lines_added', (data) => {
      const { lines } = JSON.parse(data)
      setLines(lines)
    })
  }, [socket])

  function createRelativePoint(e) {
    const boundingRect = drawingArea.current.getBoundingClientRect()
    const point = {
      x: e.clientX - boundingRect.x,
      y: e.clientY - boundingRect.y,
    }
    return point
  }
  return (
    <svg
      ref={drawingArea}
      onMouseDown={(e) => {
        setIsDrawing(true)
        const point = createRelativePoint(e)
        setLines([...lines, [point]])
      }}
      onMouseMove={(e) => {
        if (!isDrawing) return
        e.persist()
        console.log('drawing')
        setLines((prevState) => {
          const lastLine = prevState[prevState.length - 1]
          const finishedLines = prevState.filter(
            (_, index) => index !== prevState.length - 1
          )
          const point = createRelativePoint(e)
          lastLine.push(point)
          const newState = [...finishedLines, lastLine]
          return newState
        })
      }}
      onMouseUp={() => {
        setIsDrawing(false)
      }}
      onMouseLeave={() => {
        setIsDrawing(false)
      }}
      style={{
        width: `100%`,
        height: `600px`,
        border: `1px solid black`,
      }}
    >
      {lines.map((line, id) => (
        <DrawingLine key={id} line={line} />
      ))}
    </svg>
  )
}
