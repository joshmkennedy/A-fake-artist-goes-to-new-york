import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}

export const user = ({ id }) => {
  return db.user.findOne({
    include: { inRoom: true },
    where: { id },
  })
}

export const createUser = ({ input }) => {
  return db.user.create({
    data: input,
  })
}

export const updateUser = ({ id, input }) => {
  return db.user.update({
    data: input,
    where: { id },
  })
}

export const deleteUser = ({ id }) => {
  return db.user.delete({
    where: { id },
  })
}

export const joinRoom = ({ id, roomId }) => {
  return db.user.update({
    data: {
      inRoom: {
        connect: {
          id: roomId,
        },
      },
    },
    where: { id },
    include: { inRoom: true },
  })
}
