import { useState } from 'react'

import { useGameStore } from './hooks'

export default function CategoryDropdown({ socket }) {
  const roomId = useGameStore((state) => state.roomId)
  const userId = useGameStore((state) => state.userInformation.userId)

  const [categoryFormValue, setCategoryFormValue] = useState('food')
  function sendCategory() {
    if (socket) {
      socket.emit(
        'category_word_picked',
        JSON.stringify({
          userId,
          room: roomId,
          category: categoryFormValue,
        })
      )
    }
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        sendCategory()
      }}
    >
      select Category
      <select
        value={categoryFormValue}
        onChange={(e) => setCategoryFormValue(e.target.value)}
      >
        <option value="food">food</option>
        <option value="weather">weather</option>
        <option value="animals">animals</option>
      </select>
      <input type="submit" value="submit" />
    </form>
  )
}
