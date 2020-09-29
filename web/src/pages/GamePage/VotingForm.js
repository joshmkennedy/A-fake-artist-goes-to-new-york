import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

import { useGameStore } from './hooks'
function VotingForm({ socket, className }) {
  const [players, setPlayers] = useState([])
  const [voted, setVoted] = useState(false)

  const userId = useGameStore((state) => state.userInformation.userId)
  const roomId = useGameStore((state) => state.roomId)
  const userRole = useGameStore((state) => state.userInformation.userRole)

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
        userRole,
        vote, //userId of the possible faker
      })
    )
    setVoted(true)
  }
  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial={{
          y: '100%',
          x: `-50%`,
        }}
        exit={{
          y: '100%',
          x: `-50%`,
        }}
        animate={{
          y: '20px',
        }}
        transition={{
          damping: 200,
        }}
      >
        {!voted && (
          <div>
            <h3>Who has been faking???</h3>

            {userRole !== 'QUESTION_MASTER' && (
              <ul>
                {players?.map((player) => {
                  const { userName, userId } = player
                  return (
                    <li key={userId} className="player">
                      <button type="button" onClick={() => vote(userId)}>
                        <div>{userName}</div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            {userRole === 'QUESTION_MASTER' && (
              <div className="center">Waiting on players to vote....</div>
            )}
          </div>
        )}
        {voted && (
          <div className="center">
            Waiting on other players to cast their vote....
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
export default styled(VotingForm)`
  position: fixed;
  bottom: 0;
  left: 50%;
  height: 90vh;
  background: var(--grey-200);
  border-radius: 20px 20px 0 0;
  transform: translateX(-50%);
  box-shadow: var(--shadow-2xl);
  max-width: 75%;
  min-width: 300px;
  width: 100%;
  padding: 20px;
  padding-bottom: 60px; /* compensates for the animation */

  ul {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    height: 100%;
    overflow-y: scroll;
    padding-bottom: 10px;
  }

  .player button {
    box-shadow: none;
    height: 100%;
    width: 100%;
    background: transparent;
    border: 2px solid var(--grey-400);
    color: var(--grey-900);
    &:hover {
      background: var(--grey-400);
    }
  }
`
