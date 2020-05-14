import { db } from 'src/lib/db'
import { randomString } from 'src/lib/generateString'
export const rooms = () => {
  return db.room.findMany()
}

export const roomById = async (_args, { context }) => {
  console.log({ user: context?.currentUser })
  return db.room.findOne({
    where: { id: _args.id },
  })
}

export const createRoom = async ({ input }, { context }) => {
  let name

  if (!input.name) {
    name = await generateRoomName()
  } else {
    name = input.name
    const roomExists = await db.room.findOne({
      where: { name },
    })
    if (roomExists) {
      throw new Error('that name is taken')
    }
  }

  return db.room.create({
    data: {
      name,
      ownerId: context?.currentUser?.email,
    },
  })
}

export const updateRoom = ({ id, input }) => {
  return db.room.update({
    data: input,
    where: { id },
  })
}

export const deleteRoom = ({ id }) => {
  return db.room.delete({
    where: { id },
  })
}

export const generateRoomName = () => {
  async function generateUniqueName() {
    const name = randomString()
    const existingRoom = await db.room.findOne({ where: { name } })
    if (existingRoom) {
      generateUniqueName()
    } else {
      return name
    }
  }
  return generateUniqueName()
}

export const addUserInRoom = async ({ id }) => {
  const room = await db.room.findOne({ where: { id } })
  if (!room) throw new Error('No room exists with that id')

  const currentCount = room.userCount

  if (currentCount >= 8) throw new Error('this room is full')

  return db.room.update({
    data: {
      userCount: currentCount + 1,
    },
    where: { id },
  })
}

export const removeUserFromRoom = async ({ id }) => {
  const room = await db.room.findOne({ where: { id } })
  if (!room) throw new Error('No room exists with that id')

  const currentCount = room.userCount

  if (currentCount === 0) throw new Error('this room is empty')

  return db.room.update({
    data: {
      userCount: currentCount - 1,
    },
    where: { id },
  })
}
