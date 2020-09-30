export const URL = window.location.origin
export const WEBSOCKET_URL =
  URL === 'http://localhost:8910/'
    ? 'http://127.0.0.1:4001'
    : 'https://afakeartistgoestony.herokuapp.com/'
// export const WEBSOCKET_URL = 'https://afakeartistgoestony.herokuapp.com/'
