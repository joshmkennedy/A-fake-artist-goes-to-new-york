import React, { useEffect, useState, useRef } from 'react'
import socketIOClient from 'socket.io-client'

import MainLayout from 'src/layouts/MainLayout/MainLayout'
const ENDPOINT = 'http://127.0.0.1:4001'
//const USER = 'redwood'
const PaperPage = () => {
  const [socket, setSocket] = useState(false)

  const [userId, setUserId] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [activeUser, setActiveUser] = useState(null)

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

  useEffect(() => {
    if (!socket) {
      setSocket(socketIOClient(ENDPOINT))
      console.log('connected')
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('start', (data) => {
        const { userId } = JSON.parse(data)
        setUserId(userId)
      })

      socket.on('new_users', (data) => {
        const { userIds } = JSON.parse(data)
        console.log(userIds)
        setAllUsers(userIds)
      })

      socket.on('set_active_user', (data) => {
        const { activeUserId } = JSON.parse(data)
        setActiveUser(activeUserId)
        console.log(activeUserId === activeUser)
      })

      socket.on('active_user_mousemove', (data) => {})

      socket.on('drawing', (data) => {})

      socket.on('drawingStopped', () => {})

      socket.on('new_lines_added', (data) => {
        console.log('new lines added')
        const { lines } = JSON.parse(data)
        setLines(lines)
      })
    }
    return () => {
      if (socket) {
        socket.emit('disconnecting', JSON.stringify({ userId }))

        console.log('disconnected')
      }
    }
  }, [socket])

  return (
    <MainLayout>
      <h1>Redwood Site (like gatsby but comes with a backend)</h1>
      <button
        onClick={() => {
          if (!activeUser && socket) {
            socket.emit('start_game', JSON.stringify({ userId }))
          }
        }}
      >
        Start Game
      </button>
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
