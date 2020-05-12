import { db } from 'src/lib/db'

export const rooms = () => {
  return db.room.findMany({
    include: { user: true },
  })
}

export const roomById = ({ id }) => {
  return db.room.findOne({
    where: { id },
    include: { usersInRoom: true },
  })
}

export const createRoom = ({ input }) => {
  return db.room.create({
    data: {
      name: input.name,
      user: {
        connect: {
          id: input.ownerId,
        },
      },
    },
    include: {
      user: true,
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
