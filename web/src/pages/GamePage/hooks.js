import { useEffect, useState } from 'react'
import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'
import create from 'zustand'
import produce from 'immer'
import socketIOClient from 'socket.io-client'

const ROOM = gql`
  query ROOM($name: String!) {
    roomByName(name: $name) {
      ownerId
      name
    }
  }
`

export function useIsRoomOwner(room) {
  const { data: roomData, loading } = useQuery(ROOM, {
    variables: { name: room },
  })
  const { loading: authLoading, currentUser } = useAuth()
  const isOwner =
    !loading &&
    !authLoading &&
    currentUser?.email === roomData?.roomByName.ownerId
  return { isOwner }
}

export function useConnectSocket(url) {
  const [socket, setSocket] = useState(false)
  useEffect(() => {
    if (!socket) {
      setSocket(socketIOClient(url))
    }
  }, [socket, url])

  return { socket }
}

//Global store
export const useGameStore = create((set) => ({
  socket: null,
  allUsers: [],
  gameState: 'ENTERING_LOBBY',
  activeUser: null,
  questionMaster: null,
  roomId: null,
  words: {},
  userInformation: {
    userId: '',
    userRole: null,
    inRoom: false,
    userName: '',
    isOwner: false,
  },
  set: (fn) => set(produce(fn)),
}))

export function useSetupGame(socket, room) {
  const { currentUser } = useAuth()
  const { isOwner } = useIsRoomOwner(room)
  console.log({ isOwner }, 'from hooks.js')
  const set = useGameStore((state) => state.set)
  useEffect(() => {
    if (socket) {
      set((state) => {
        state.socket = socket
      })
    }
  }, [set, socket])
  useEffect(() => {
    if (isOwner) {
      set((state) => {
        state.userInformation.isOwner = true
      })
    }
  }, [set, isOwner])

  useEffect(() => {
    if (socket) {
      socket.on('room_state_update', (data) => {
        const gameState = data
        set((state) => {
          state.gameState = gameState
        })
      })
    }
  }, [socket, set])

  useEffect(() => {
    if (room) {
      set((state) => {
        state.roomId = room
      })
    }
  }, [set, room])
  useEffect(() => {
    if (currentUser) {
      set((state) => {
        state.userInformation.userName = currentUser?.user_metadata.full_name
      })
    }
  }, [set, currentUser])
}

//TODO write function enterRoom(room:roomId, userInformation:{userName})