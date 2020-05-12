export const schema = gql`
  type Room {
    id: Int!
    name: String!
    user: User
    active: Boolean
    inGame: Boolean
    usersInRoom: [User]
  }
  type Query {
    rooms: [Room!]!
    roomById(id: Int!): Room!
  }

  input CreateRoomInput {
    ownerId: Int!
    name: String!
  }
  input UpdateRoomInput {
    name: String
    active: Boolean
  }

  type Mutation {
    createRoom(input: CreateRoomInput!): Room!
    deleteRoom(id: Int!): Room!
    updateRoom(id: Int!, input: UpdateRoomInput!): Room!
  }
`
