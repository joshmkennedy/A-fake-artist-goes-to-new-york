import { useState } from 'react'
import styled from 'styled-components'
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
const CreateGameForm = ({ className }) => {
  const [create, { data, loading, error }] = useMutation(CREATE_ROOM, {})
  const [notHumanQM, setNotHumanQM] = useState(false)
  const onSubmit = (e) => {
    e.preventDefault()
    create({
      variables: {
        input: {
          isHuman: !notHumanQM,
        },
      },
    })
  }

  const [isShowOptions, setIsShowOptions] = useState(false)

  return (
    <div className={className}>
      <form onSubmit={onSubmit}>
        <button className="create-btn">
          creat{loading ? 'ing' : 'e'} game
        </button>
        <span>
          <button
            className="showOptions"
            type="button"
            onClick={() => setIsShowOptions((prev) => !prev)}
          >
            {' '}
            {!isShowOptions ? <span>&darr;</span> : <span>&uarr;</span>}
          </button>
          {isShowOptions && (
            <label>
              use robot question master
              <input
                type="checkbox"
                name="humanQM"
                id="notHumanQM"
                value={notHumanQM}
                onChange={() => setNotHumanQM((prev) => !prev)}
              />
            </label>
          )}
        </span>
      </form>

      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      {data && (
        <div>
          <Link to={routes.paper({ roomId: data.createRoom.name })}>
            {URL}/paper/{data.createRoom.name}
          </Link>
        </div>
      )}
    </div>
  )
}

export default styled(CreateGameForm)`
  form {
    display: flex;
  }
  .create-btn {
    border-radius: 4px 0px 0px 4px;
  }
  .showOptions {
    border-radius: 0px 4px 4px 0px;
    background: var(--dark-blue);
  }
`
