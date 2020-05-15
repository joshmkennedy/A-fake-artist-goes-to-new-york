import { useMutation } from '@redwoodjs/web'
import { routes, Link } from '@redwoodjs/router'

import { URL } from 'src/config'
export const CREATE_ROOM = gql`
  mutation CREATE_ROOM($input: CreateRoomInput!) {
    createRoom(input: $input) {
      name
      id
    }
  }
`
const CreateGameForm = () => {
  const [create, { data, loading, error }] = useMutation(CREATE_ROOM, {})

  const onClick = () => {
    create({
      variables: {
        input: {},
      },
    })
  }

  return (
    <>
      <button onClick={onClick}>creat{loading ? 'ing' : 'e'} game</button>
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      {data && (
        <Link to={routes.paper({ roomId: data.createRoom.name })}>
          {URL}/paper/{data.createRoom.name}
        </Link>
      )}
    </>
  )
}

export default CreateGameForm
