import React, { useEffect, useState, useRef } from 'react'
import socketIOClient from 'socket.io-client'
import _ from 'lodash'

import MainLayout from 'src/layouts/MainLayout/MainLayout'
const ENDPOINT = 'http://127.0.0.1:4001'
//const USER = 'redwood'
const HomePage = () => {
  const [socket, setSocket] = useState(false)

  const [userId, setUserId] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [room, setRoom] = useState()
  const [lines, setLines] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const drawingArea = useRef()

  function createRelativePoint(e) {
    const boundingRect = drawingArea.current.getBoundingClientRect()
    const point = {
      x: e.clientX - boundingRect.x,
      y: e.clientY - boundingRect.y,
    }
    return point
  }
  const isUsersTurn = useRef()
  useEffect(() => {
    isUsersTurn.current = userId === activeUser
  }, [userId, activeUser])

  function endTurn(e) {
    if (!socket) return
    console.log('ran')
    console.log(room)
    socket.emit('end_turn', JSON.stringify({ room }))
  }

  useEffect(() => {
    if (!socket) {
      setSocket(socketIOClient(ENDPOINT))
      console.log('connected')
    }
  }, [socket])

  useEffect(() => {
    if (socket) {
      socket.on('start', (data) => {
        const { userId, room } = JSON.parse(data)
        setUserId(userId)
        setRoom(room)
        console.log(room)
      })

      socket.on('new_users', (data) => {
        console.log('gotit')
        const { userIds } = JSON.parse(data)
        console.log(userIds)
        setAllUsers(userIds)
      })

      socket.on('set_active_user', (data) => {
        const { activeUserId } = JSON.parse(data)
        setActiveUser(activeUserId)
        console.log(activeUserId)
      })

      socket.on('new_lines_added', (data) => {
        console.log(isUsersTurn.current)
        if (isUsersTurn.current === false) {
          const { lines } = JSON.parse(data)
          setLines(lines)
        }
      })
    }
    return () => {
      if (socket) {
        socket.emit('disconnecting', JSON.stringify({ userId, room }))
        console.log('disconnected')
      }
    }
  }, [socket, isUsersTurn])

  const submitlines = (socket, userId, lines, room) => {
    if (socket) {
      socket.emit('new_lines_added', JSON.stringify({ lines, userId, room }))
    }
  }
  const fn = useRef(_.throttle(submitlines, 100)).current
  useEffect(() => {
    if (socket && isUsersTurn.current === true) {
      fn(socket, userId, lines, room)
    }
  }, [lines, fn, socket, userId, isUsersTurn, room])

  return (
    <MainLayout>
      <h1>Redwood Site (like gatsby but comes with a backend)</h1>
      <button
        onClick={() => {
          if (!activeUser && socket) {
            socket.emit('start_game', JSON.stringify({ userId, room }))
          }
        }}
      >
        Start Game
      </button>
      {userId === activeUser && <button onClick={endTurn}>End Turn</button>}
      <ul style={{ display: `flex` }}>
        {allUsers.map((user) => (
          <li
            style={{
              backgroundColor: user === activeUser ? `blue` : `white`,
            }}
            key={user}
          >
            {user}
          </li>
        ))}
      </ul>
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
        style={{ width: `100%`, height: `600px`, border: `1px solid black` }}
      >
        {lines.map((line, id) => (
          <DrawingLine key={id} line={line} />
        ))}
      </svg>
    </MainLayout>
  )
}

export default HomePage

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
