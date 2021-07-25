const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''
import { getUsersByRoom } from './lib/database-interface'
import { joinRoom } from './lib/telegram-extension'
import { sendMessage } from './lib/telegram-inteface'

export async function handler(event: any, context: any) {
  if (event.httpMethod == 'POST') {
    const body = JSON.parse(event.body)
    var res = await processPostReq(body)
  }
  return {
    statusCode: 200,
    body: res ? res : 'done',
  }
}

async function processPostReq(body: any) {
  switch (body.function) {
    case 'move_user':
      await joinRoom(body.user_id, body.room)
      return `User: ${body.user_id} moved to room: ${body.room}`
    case 'broadcast':
      let users = await getUsersByRoom(body.room)
      for (var userId of users)
        await sendMessage(TELE_BOT_KEY, userId, body.message)
      return `Broadcasted message to Room ${body.room}`
    case 'test':
      return 'Test function executed'
    default:
  }
}
