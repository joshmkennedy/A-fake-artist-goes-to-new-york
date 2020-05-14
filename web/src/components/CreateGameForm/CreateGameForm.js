import { useMutation } from '@redwoodjs/web'
import { routes, Link } from '@redwoodjs/router'
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
  const [name, setName] = React.useState('')
  const onClick = () => {
    create({
      variables: {
        input: {
          name,
        },
      },
    })
  }

  return (
    <>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={onClick}>creat{loading ? 'ing' : 'e'} game</button>
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      {data && (
        <Link to={routes.paper({ roomId: data.createRoom.name })}>
          http://localhost:8910/paper/{data.createRoom.name}
        </Link>
      )}
    </>
  )
}

export default CreateGameForm
