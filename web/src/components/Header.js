import { useAuth } from '@redwoodjs/auth'

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
      </div>
    </>
  )
}
export default Header
