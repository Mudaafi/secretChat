export interface UserDocument {
  id: string
  username: string
  room: string
}

export enum DatabaseResponse {
  SUCESSS = 'SUCCESS',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  FAILED_TO_JOIN_ROOM = 'FAILED_TO_JOIN_ROOM',
}
