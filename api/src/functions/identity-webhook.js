//!NOT USING THIS ANYMORE
/* import { login, signup, validate } from '../services/users/users'

function acceptWebhook(eventType, user) {
  let status
  switch (eventType) {
    case 'login':
      status = login(user)
      break
    case 'signup':
      status = signup(user)
      break
    case 'validate':
      status = validate(user)
      break
    default:
      status = 200
  }
  return status
}

export const handler = (event, context, callback) => {
  const { body } = event
  const { event: eventType, user } = JSON.parse(body)

  const statusCode = acceptWebhook(eventType, user)
  console.log(statusCode)
  return callback(null, { statusCode })
}
 */
