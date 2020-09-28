import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import { useAuth } from '@redwoodjs/auth'

import MainLayout from 'src/layouts/MainLayout/MainLayout'

import { EnterRoomCard } from './EnterRoomCard'
import { useIsRoomOwner, useConnectSocket, useRoomState } from './hooks'
const ENDPOINT = 'http://127.0.0.1:4001' //todo put in env

const PaperPage = ({ roomId }) => {
  //USERS
  const { currentUser } = useAuth()
  const [userInformation, setUserInformation] = useState({
    userId: '',
    userName: currentUser ? currentUser.user_metadata.full_name : '',
  })
  const { socket, enterRoom } = useConnectSocket(ENDPOINT, {
    room: roomId,
    userInformation,
  })

  const { isOwner } = useIsRoomOwner(roomId)
  const [allUsers, setAllUsers] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  //Room/Game State
  const [questionMaster, setQuestionMaster] = useState(null)
  const [inRoom, setInRoom] = useState(false)
  const { roomState, setRoomState } = useRoomState(socket)

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
        console.log('new_users')
        const { userList } = JSON.parse(data)
        setAllUsers([...userList])
      })

      socket.on('set_active_user', (data) => {
        const { activeUserId } = JSON.parse(data)
        setActiveUser(activeUserId)
      })

      socket.on('role_chosen', (data) => {
        const { role } = JSON.parse(data)
        setUserRole(role)
      })
      socket.on('question_master_chosen', (data) => {
        const { user } = JSON.parse(data)
        setQuestionMaster(user)
      })
      socket.on('category_picked', (data) => {
        console.log('Need to Write a function for category picked')
      })
      socket.on('picked_word', (data) => {
        console.log(JSON.parse(data))
        console.log('Need to Write a function for category picked')
      })
      socket.on('turn_ended', (data) => {
        console.log('Need to Write a function for turn_ended')
      })
      socket.on('vote_on_faker', (data) => {
        console.log('Need to Write a function for vote_on_faker')
      })
      socket.on('expose_faker', (data) => {
        console.log('Need to Write a function for expose_faker')
      })
    }
    function disconnect() {
      if (socket) {
        console.log(roomId)
        socket.emit(
          'disconnecting',
          JSON.stringify({
            room: roomId,
          })
        )
        console.log('disconnected')
        setInRoom(false)
      }
    }
    return () => {
      //need to know the userInformation and room thats why its in the user section
      disconnect()
    }
  }, [
    socket,
    setInRoom,
    setActiveUser,
    setAllUsers,
    setUserInformation,
    setRoomState,
    setQuestionMaster,
    setUserRole,
    roomId,
  ])

  function endTurn() {
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
  const [categoryFormValue, setCategoryFormValue] = useState('food')
  function sendCategory() {
    if (socket) {
      socket.emit(
        'category_word_picked',
        JSON.stringify({
          userId: questionMaster,
          room: roomId,
          category: categoryFormValue,
        })
      )
    }
  }

  return (
    <MainLayout>
      <h1>{roomId}</h1>

      {!inRoom && (
        <EnterRoomCard
          {...{
            enterRoom,
            userInformation,
            setUserInformation,
          }}
        />
      )}
      {inRoom && isOwner && <button onClick={startGame}>Start Game</button>}

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
      <h3>{userRole && userRole}</h3>
      <h3>
        {questionMaster &&
          allUsers.find((user) => user.id === questionMaster).name}
      </h3>
      {userRole === 'QUESTION_MASTER' && roomState === 'PICKING_WORD' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendCategory()
          }}
        >
          select Category
          <select
            value={categoryFormValue}
            onChange={(e) => setCategoryFormValue(e.target.value)}
          >
            <option value="food">food</option>
            <option value="weather">weather</option>
            <option value="animals">animals</option>
          </select>
          <input type="submit" value="submit" />
        </form>
      )}
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
const Paper = ({ socket, activeUser, userInformation, room }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const drawingArea = useRef()
  const [lines, setLines] = useState([])
  const submitLines = (socket, userInformation, lines, room) => {
    if (socket) {
      socket.emit(
        'new_lines_added',
        JSON.stringify({ lines, userId: userInformation.userId, room })
      )
    }
  }
  const fn = useRef(_.throttle(submitLines, 100)).current
  useEffect(() => {
    if (socket && activeUser === userInformation.userId) {
      fn(socket, userInformation, lines, room)
    }
  }, [lines, fn, socket, userInformation, activeUser, room])

  useEffect(() => {
    if (!socket) return
    socket.on('new_lines_added', (data) => {
      console.log('new lines ')
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
