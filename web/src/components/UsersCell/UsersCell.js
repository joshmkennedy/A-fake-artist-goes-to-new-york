import { Link, routes } from '@redwoodjs/router'

import Users from 'src/components/Users'

export const QUERY = gql`
  query USERS {
    users {
      id
      email
      name
      password
    }
  }
`

export const beforeQuery = (props) => {
  return { variables: props, fetchPolicy: 'cache-and-network' }
}

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="text-center">
      {'No users yet. '}
      <Link
        to={routes.newUser()}
        className="text-blue-500 underline hover:text-blue-700"
      >
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Success = ({ users }) => {
  return <Users users={users} />
}
