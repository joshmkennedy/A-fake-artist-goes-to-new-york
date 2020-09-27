import { useEffect, useState } from 'react'
import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'
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
  const { data: roomData, loading, error } = useQuery(ROOM, {
    variables: { name: room },
  })
  const { loading: authLoading, currentUser } = useAuth()
  const isOwner =
    !loading &&
    !authLoading &&
    currentUser?.email === roomData?.roomByName.ownerId
  return { isOwner }
}

export function useConnectSocket(url, info) {
  const [socket, setSocket] = useState(false)
  useEffect(() => {
    if (!socket) {
      setSocket(socketIOClient(url))
    }
  }, [socket, url])
  function enterRoom() {
    console.log(info)
    socket.emit('enter_room', JSON.stringify(info))
  }
  return { socket, enterRoom }
}

//GAME STATE
export function useRoomState(socket) {
  const [roomState, setRoomState] = useState()
  useEffect(() => {
    if (socket) {
      socket.on('room_state_update', (data) => {
        const state = data
        setRoomState(state)
      })
    }
  }, [socket])
  return { roomState, setRoomState }
}
