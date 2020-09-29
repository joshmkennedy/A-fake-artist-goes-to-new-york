import React, { useEffect } from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { useConnectSocket, useSetupGame, useGameStore } from 'src/hooks'
import { navigate, routes } from '@redwoodjs/router'

import MainLayout from 'src/layouts/MainLayout/MainLayout'
import { WEBSOCKET_URL } from 'src/config'

import Lobby from './Lobby'
import UserList from './UserList'
import VotingForm from './VotingForm'
import CategoryInfoCard from './CategoryInfoCard'
import Paper from './Paper'

const GamePage = ({ roomId }) => {
  const { socket } = useConnectSocket(WEBSOCKET_URL)
  useSetupGame(socket, roomId)

  const set = useGameStore((state) => state.set)
  const userInformation = useGameStore((state) => state.userInformation)

  const { userRole } = userInformation

  const activeUser = useGameStore((state) => state.activeUser)
  const gameState = useGameStore((state) => state.gameState)
  const winners = useGameStore((state) => state.winners)

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
        const { winners, isFaker, faker } = JSON.parse(data)
        set((state) => {
          state.winners = winners
          state.isFaker = isFaker
          state.faker = faker
        })
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
  if (gameState === 'EXPOSE' && winners) navigate(routes.expose({ roomId }))
  return (
    <MainLayout>
      <div>
        <h1>{userInformation.userName}</h1>
        <h3>{userRole && userRole}</h3>

        <GameBody>
          <div>
            <CategoryInfoCard socket={socket} />
          </div>

          <div className="side-by-side align-end">
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
