export function EnterRoomCard({
  userInformation,
  setUserInformation,
  enterRoom,
}) {
  const { userName } = userInformation

  return (
    <div>
      <h3>Enter Your Name and enter the Game</h3>
      <input
        type="text"
        value={userName}
        onChange={(e) =>
          setUserInformation({ ...userInformation, userName: e.target.value })
        }
      />
      <button onClick={enterRoom}>Enter the Game</button>
    </div>
  )
}
