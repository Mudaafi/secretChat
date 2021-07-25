import { TeleUser } from './tele-types'

import faunadb, {
  Paginate,
  Get,
  Match,
  Index,
  Call,
  Update,
  Select,
  Create,
  Function as Fn,
  Exists,
} from 'faunadb'
import { DatabaseResponse, UserDocument } from './models'
const client = new faunadb.Client({ secret: process.env.FAUNADB_KEY || '' })

interface QueryResults {
  data: Array<QueryResult>
}
interface QueryResult {
  data: Array<any>
}

export async function test() {
  let x = await client.query(Paginate(Match(Index('test'))))
  console.log(x)
}

export async function registerUserInDb(
  user: TeleUser,
): Promise<DatabaseResponse> {
  let userExists = await client.query(
    Exists(Match(Index('users_by_id'), user.id.toString())),
  )
  if (userExists) return DatabaseResponse.USER_ALREADY_EXISTS

  let newUser: UserDocument = {
    id: user.id.toString(),
    username: user.username || 'anon',
    room: user.id.toString(),
  }

  await client.query(Create('users', newUser))

  return DatabaseResponse.SUCESSS
}

export async function updateRoomInDb(userId: string, room: string) {
  try {
    await client.query(
      Update(Select('ref', Get(Match(Index('users_by_id'), userId))), {
        data: { room: room },
      }),
    )
  } catch {
    return DatabaseResponse.FAILED_TO_JOIN_ROOM
  }
  return DatabaseResponse.SUCESSS
}

export async function getNearbyUsers(userId: string): Promise<Array<string>> {
  let x: QueryResults = await client.query(Call(Fn('getNearbyUsers'), userId))
  return x.data[0].data
}

export async function getUsersByRoom(room: String): Promise<Array<string>> {
  let x: QueryResults = await client.query(
    Paginate(Match(Index('userids_by_room'), room)),
  )
  return x.data[0].data
}
