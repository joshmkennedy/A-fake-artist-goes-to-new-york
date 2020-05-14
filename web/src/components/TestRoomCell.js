import { Link, routes } from '@redwoodjs/router'
import Users from 'src/components/Users'

export const QUERY = gql`
  query ROOMS {
    roomById(id: 1) {
      userCount
      name
    }
  }
`

export const beforeQuery = (props) => {
  return { variables: props, fetchPolicy: 'cache-and-network' }
}

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return <div className="text-center">EMPTY</div>
}

export const Success = ({ roomById }) => {
  return (
    <>
      <pre>{JSON.stringify(roomById, null, 2)}</pre>
    </>
  )
}
