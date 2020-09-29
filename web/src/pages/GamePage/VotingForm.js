import { useEffect, useState } from 'react'

import { useGameStore } from './hooks'
function VotingForm({ socket }) {
  const [players, setPlayers] = useState([])
  const userId = useGameStore((state) => state.userInformation.userId)
  const roomId = useGameStore((state) => state.roomId)

  useEffect(() => {
    if (socket) {
      socket.on('vote_on_faker', (data) => {
        const { players } = JSON.parse(data)
        setPlayers(players)
      })
    }
  }, [socket, setPlayers])

  function vote(vote) {
    socket.emit(
      'vote_submitted',
      JSON.stringify({
        room: roomId,
        userId,
        vote, //userId of the possible faker
      })
    )
  }
  return (
    <div>
      <h3>vote_submitted</h3>
      <ul>
        {players?.map((player) => {
          const { userName, userId } = player
          return (
            <li key={userId}>
              <div>{userName}</div>
              <button type="button" onClick={() => vote(userId)}>
                is the faker
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
export default VotingForm
