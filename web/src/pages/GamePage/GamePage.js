import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import styled from 'styled-components'

import MainLayout from 'src/layouts/MainLayout/MainLayout'
import { WEBSOCKET_URL } from 'src/config'

import Lobby from './Lobby'
import UserList from './UserList'
import VotingForm from './VotingForm'
import CategoryInfoCard from './CategoryInfoCard'
import { useConnectSocket, useSetupGame, useGameStore } from './hooks'

const GamePage = ({ roomId }) => {
  const { socket } = useConnectSocket(WEBSOCKET_URL)
  useSetupGame(socket, roomId)

  const set = useGameStore((state) => state.set)
  const userInformation = useGameStore((state) => state.userInformation)

  const { userRole } = userInformation

  const activeUser = useGameStore((state) => state.activeUser)
  const gameState = useGameStore((state) => state.gameState)

  useEffect(() => {
    if (socket) {
      console.log('connected')
      socket.on('enter_lobby', (data) => {
        const { newUser, state: gameState } = JSON.parse(data)
        set((state) => {
          state.userInformation.inRoom = true
          state.userInformation.userId = newUser.userId
          state.userInformation.userId = newUser.userId

          state.gameState = gameState
        })
      })

      socket.on('new_users', (data) => {
        const { userList } = JSON.parse(data)
        set((state) => {
          state.allUsers = [...userList]
        })
      })

      socket.on('set_active_user', (data) => {
        const { activeUserId } = JSON.parse(data)
        set((state) => {
          state.activeUser = activeUserId
        })
      })

      socket.on('role_chosen', (data) => {
        const { role } = JSON.parse(data)
        set((state) => {
          state.userInformation.userRole = role
        })
      })
      socket.on('question_master_chosen', (data) => {
        const { user } = JSON.parse(data)
        set((state) => {
          state.questionMaster = user
        })
      })
      socket.on('category_picked', (data) => {
        const { category } = JSON.parse(data)
        set((state) => {
          state.words.category = category
          state.words.pickedWord = '...'
        })
      })
      socket.on('picked_word', (data) => {
        const { pickedWord } = JSON.parse(data)
        set((state) => {
          state.words.pickedWord = pickedWord
        })
      })
      socket.on('turn_ended', (data) => {
        console.log('Need to Write a function for turn_ended')
      })

      socket.on('expose_faker', (data) => {
        console.log(JSON.parse(data))
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
        set((state) => {
          state.userInformation.inRoom = false
        })
      }
    }
    return () => {
      //need to know the userInformation and room thats why its in the user section
      disconnect()
    }
  }, [socket, roomId, set])

  if (gameState === 'ENTERING_LOBBY' || gameState === 'WAITING') {
    return (
      <MainLayout>
        <Lobby socket={socket} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div>
        <h1>{userInformation.userName}</h1>
        <h3>{userRole && userRole}</h3>

        <GameBody>
          <div>
            <CategoryInfoCard socket={socket} />
          </div>

          <div className="side-by-side">
            <UserList socket={socket} flatRight />
            <Paper
              {...{
                room: roomId,
                socket,
                userInformation,
                activeUser,
              }}
            />
          </div>
        </GameBody>
        {gameState === 'VOTING' && <VotingForm socket={socket} />}
        {gameState === 'EXPOSE' && 'Expose the Faker'}
      </div>
    </MainLayout>
  )
}

export default GamePage

const GameBody = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 250px 1fr;
  column-gap: 20px;
  > div {
    width: 100%;
  }
`

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
  const gameState = useGameStore((state) => state.gameState)
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
    <div
      className="paper card"
      style={{
        background: `white`,
        boxShadow: `var(--shadow-xl)`,
        border: `3px solid var(--blue)`,
        borderRadius: `0px 10px 10px 10px`,
      }}
    >
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
        }}
      >
        {lines.map((line, id) => (
          <DrawingLine key={id} line={line} />
        ))}
      </svg>
      <div className="top-right" style={{ color: `var(--blue)` }}>
        {gameState}
      </div>
    </div>
  )
}
