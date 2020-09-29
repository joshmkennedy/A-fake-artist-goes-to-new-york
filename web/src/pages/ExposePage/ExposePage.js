import { useGameStore } from 'src/hooks'
import { navigate, routes } from '@redwoodjs/router'

import MainLayout from 'src/layouts/MainLayout/MainLayout'
const ExposePage = ({ roomId }) => {
  const gameState = useGameStore((state) => state.gameState)
  const winners = useGameStore((state) => state.winners)
  const faker = useGameStore((state) => state.faker)
  const isFaker = useGameStore((state) => state.isFaker)
  if (gameState !== 'EXPOSE') navigate(routes.home())
  return (
    <MainLayout>
      <div>
        <h1>{isFaker && isFaker ? 'Exposed!' : 'Fooled!'}</h1>
        {isFaker ? (
          <p>{faker?.userName} was found to be an imposter</p>
        ) : (
          <p>{faker?.userName} succeeded in fooling everyone</p>
        )}
        <div>
          <h3>Winners:</h3>
          <ul>
            {winners?.map((winner) => (
              <li key={winner.userId}>{winner.userName}</li>
            ))}
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}

export default ExposePage
