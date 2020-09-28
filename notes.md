# Notes

## Websocket Events
### Events Sever Responds to From Frontend
- enter_room
- start_game
- category_word_picked
- new_lines_added
- end_turn
- votes_submitted
- disconnecting

### Events Frontend Responds to From Server
- start
- new_users
- room_state_update
- role_chosen
- question_master_chosen
- category_picked - this needs implementation
- turn_ended - needs implementation
- set_active_user
- new_lines_added
- vote_on_faker - needs implementation
- expose_faker - needs implementation


##  Server TODOS:
- organize code
  - pull out helpers to create library
- exposeFaker function
- make queries to my api from websockets: [graphql-request](https://www.npmjs.com/package/graphql-request)
- Some sort of validation
- Lots of other stuff
- Some bug where sometimes selectRole errors out !!!!

##  Frontend TODOS:
- Styling
- break out into components
- Add Zustand and Immer for state management
- Lots of other stuff
