export const schema = gql`
  type Room {
    id: Int!
    name: String
    ownerId: String
    active: Boolean
    userCount: Int
  }
  type Query {
    rooms: [Room]!
    roomById(id: Int!): Room!
    roomByName(name: String!): Room!
  }

  input CreateRoomInput {
    name: String
  }
  input UpdateRoomInput {
    name: String
    active: Boolean
  }

  type Mutation {
    createRoom(input: CreateRoomInput!): Room!
    deleteRoom(id: Int!): Room!
    updateRoom(id: Int!, input: UpdateRoomInput!): Room!
    generateRoomName(input: String): String!
    addUserInRoom(id: Int!): Room!
    removeUserFromRoom(id: Int!): Room!
    clearAllRooms(secret: String!): String!
  }
`
