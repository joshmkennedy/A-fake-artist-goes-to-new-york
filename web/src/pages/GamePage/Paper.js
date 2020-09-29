import { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import { useGameStore } from 'src/hooks'

export default function Paper({ socket, activeUser, userInformation, room }) {
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
        borderRadius: `0px 10px 10px 0px`,
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
