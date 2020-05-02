import { useRef, useEffect, useState } from 'react'
import MainLayout from 'src/layouts/MainLayout'
const PaperPage = () => {
  const canvasEl = useRef()
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  function draw(ctx, location) {
    if (!isDrawing) return
    console.log(ctx)
    const { x, y } = location
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  return (
    <MainLayout>
      <h1>PaperPage</h1>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasEl}
        onMouseMove={(e) => {
          e.persist()
          const canvas = canvasEl.current
          let ctx = canvas.getContext('2d')
          ctx.strokeStyle = '#BADA55'
          ctx.lineJoin = 'round'
          ctx.lineCap = 'round'
          ctx.lineWidth = 50
          const { left, top } = canvas.getBoundingClientRect()
          const { clientX, clientY } = e
          const position = {
            x: clientX - left,
            y: clientY - top,
          }
          draw(ctx, position)
          setLastPos(position)
        }}
        onMouseDown={() => setIsDrawing(true)}
        onMouseUp={() => setIsDrawing(false)}
        onMouseOut={() => setIsDrawing(false)}
        id="draw"
      ></canvas>
    </MainLayout>
  )
}

export default PaperPage
