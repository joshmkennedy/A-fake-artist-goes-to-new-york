import styled from 'styled-components'
import { useGameStore } from 'src/hooks'

import EnterRoomCard from './EnterRoomCard'
import UserList from './userList'
function Lobby({ socket, className }) {
  const inRoom = useGameStore((state) => state.userInformation.inRoom)
  const gameState = useGameStore((state) => state.gameState)
  const { isOwner, userId } = useGameStore((state) => state.userInformation)
  const roomId = useGameStore((state) => state.roomId)

  return (
    <div className={className}>
      <div style={{ width: `100%` }}>
        {gameState === 'ENTERING_LOBBY' && <EnterRoomCard socket={socket} />}
        {inRoom && (
          <>
            <h3 style={{ textAlign: 'center' }}>Waiting to start the game!</h3>
            <UserList socket={socket} />
          </>
        )}
      </div>
    </div>
  )
}
export default styled(Lobby)`
  height: 100%;
  min-height: calc(var(--min-height) - 200px);
  display: grid;
  place-items: center;
`
