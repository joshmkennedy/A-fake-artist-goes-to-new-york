import styled from 'styled-components'
import { useGameStore } from 'src/hooks'

import CategoryDropdown from './CategoryDropdown'

function CategoryInfoCard({ className, socket }) {
  const { category, pickedWord } = useGameStore((state) => state.words)
  const gameState = useGameStore((state) => state.gameState)
  const { userRole } = useGameStore((state) => state.userInformation)
  return (
    <div className={`card ${className}`}>
      {userRole === 'QUESTION_MASTER' && gameState === 'PICKING_WORD' && (
        <CategoryDropdown socket={socket} />
      )}

      {(category || userRole !== 'QUESTION_MASTER') && (
        <>
          <div>
            Category:
            <span style={{ color: 'var(--green)' }}>
              {category ? category : 'being picked'}
            </span>
          </div>
          {category && (
            <div>
              Word:
              <span style={{ color: 'var(--blue)', fontSize: '1.34em' }}>
                {pickedWord ? pickedWord : 'being generated'}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
export default styled(CategoryInfoCard)`
  background: var(--grey-100);
`
