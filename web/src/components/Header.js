import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'
import CreateGameForm from 'src/components/CreateGameForm'

import Logo from './Logo/Logo'
function Header() {
  const { loading, authenticated, login, logout, currentUser } = useAuth()
  async function authFn() {
    if (authenticated) {
      await logout()
    } else {
      await login()
    }
  }

  return (
    <>
      <h1>
        <Logo />
      </h1>

      <div>
        {loading ? null : (
          <button onClick={authFn}>{authenticated ? `Logout` : `Login`}</button>
        )}
        {authenticated && <CreateGameForm />}
      </div>
    </>
  )
}
export default Header
