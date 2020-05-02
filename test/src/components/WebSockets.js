import React, { useEffect, useState, useRef } from "react"
import socketIOClient from "socket.io-client"

const ENDPOINT = "http://127.0.0.1:4001"

const HomePage = () => {
  const [socket, setSocket] = useState(false)

  const [userId, setUserId] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const canvasEl = useRef()

  useEffect(() => {
    if (!socket) {
      setSocket(socketIOClient(ENDPOINT))
      console.log("connected")
    }
  }, [])

  //TODO Rewrite drawing functionality to use svg instead of canvas.
  function draw(ctx, location) {
    if (!drawing) return

    ctx.strokeStyle = "#BADA55"
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = 50

    const { x, y } = location
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  useEffect(() => {
    if (socket) {
      socket.on("start", data => {
        const { userId } = JSON.parse(data)
        setUserId(userId)
      })

      socket.on("new_users", data => {
        const { userIds } = JSON.parse(data)
        setAllUsers(userIds)
      })

      socket.on("set_active_user", data => {
        const { activeUserId } = JSON.parse(data)
        setActiveUser(activeUserId)
      })

      socket.on("active_user_mousemove", data => {
        if (activeUser === userId) return
        const { ctx, position } = JSON.parse(data)
        if (drawing) {
          draw(ctx, position)
        }
        setLastPos(position)
      })

      socket.on("drawing", data => {
        if (activeUser === userId) return
        const { userId } = JSON.parse(data)
        if (userId === activeUser) {
          setDrawing(drawing)
        }
      })

      socket.on("drawingStopped", () => {
        if (activeUser === userId) return
        setDrawing(false)
        setLastPos({ x: 0, y: 0 })
      })
    }
    return () => {
      if (socket) {
        socket.emit("disconnecting", JSON.stringify({ userId }))

        console.log("disconnected")
      }
    }
  }, [socket])

  return (
    <>
      <h1>Redwood Site (like gatsby but comes with a backend)</h1>
      <button
        onClick={() => {
          if (!activeUser && socket) {
            socket.emit("start_game", JSON.stringify({ userId }))
          }
        }}
      >
        Start Game
      </button>
      <ul style={{ display: `flex` }}>
        {allUsers.map(user => (
          <li
            style={{
              backgroundColor: user === activeUser ? `blue` : `white`,
            }}
            key={user}
          >
            {user}
          </li>
        ))}
      </ul>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasEl}
        onMouseMove={e => {
          if (activeUser !== userId) return
          e.persist()
          const canvas = canvasEl.current
          let ctx = canvas.getContext("2d")
          const { left, top } = canvas.getBoundingClientRect()
          const { clientX, clientY } = e
          const position = {
            x: clientX - left,
            y: clientY - top,
          }
          draw(ctx, position)
          setLastPos(position)

          if (socket) {
            socket.emit(
              "active_user_mousemove",
              JSON.stringify({ ctx, position })
            )
          }
        }}
        onMouseDown={() => {
          if (activeUser !== userId) return
          setDrawing(true)
          if (socket) {
            socket.emit("drawing", JSON.stringify({ userId }))
          }
        }}
        onMouseUp={() => {
          if (activeUser !== userId) return
          setDrawing(false)
          if (socket) {
            socket.emit("drawingStopped", JSON.stringify({ userId }))
          }
        }}
        onMouseOut={() => {
          if (activeUser !== userId) return
          setDrawing(false)
          if (socket) {
            socket.emit("drawingStopped", JSON.stringify({ userId }))
          }
        }}
        id="draw"
      ></canvas>
    </>
  )
}

export default HomePage
