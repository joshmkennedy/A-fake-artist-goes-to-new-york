import styled from 'styled-components'

import { useGameStore } from './hooks'
function EnterRoomCard({ socket, className }) {
  const { userName } = useGameStore((state) => state.userInformation)
  const roomId = useGameStore((state) => state.roomId)
  const set = useGameStore((state) => state.set)

  function updateUserName(e) {
    const { value } = e.target
    set((state) => {
      state.userInformation.userName = value
    })
  }
  console.log(roomId)
  function enterRoom(e) {
    e.preventDefault()
    socket.emit(
      'enter_room',
      JSON.stringify({
        room: roomId,
        userInformation: { userName },
      })
    )
  }
  return (
    <div className={`${className} card`}>
      <h3>Enter Your Name and enter the Game</h3>
      <form onSubmit={enterRoom}>
        <input type="text" value={userName} onChange={updateUserName} />
        <button>Enter the Game</button>
      </form>
    </div>
  )
}
export default styled(EnterRoomCard)`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  form {
    display: flex;
  }
`
