import {
  getNearbyUsers,
  registerUserInDb,
  updateRoomInDb,
} from './database-interface'
import { DatabaseResponse } from './models'
import {
  TeleInlineKeyboard,
  TeleMessage,
  TeleReplyKeyboard,
  TeleUpdate,
} from './tele-types'
import { forwardMessage, sendMessage } from './telegram-inteface'

const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''
const DEV_ID = process.env.DEV_ID || ''

export async function processTeleMsg(message: TeleMessage) {
  if (!message.from) return
  if (message.from.id !== message.chat.id) return // Not from private chat

  if (message.from.id.toString() == DEV_ID) await processDevCommands(message)

  if (message.text) {
    switch (message.text) {
      case '/start':
        let res = await registerUserInDb(message.from)
        if (res == DatabaseResponse.SUCESSS) {
          await sendMsg(message.from.id, 'Registration Successful.')
          await sendMsg(DEV_ID, 'A new user has joined :D')
        }
        return sendMsg(message.from.id, '/join a room!')

      case '/help':
        return sendMsg(
          message.from.id,
          `For issues/feedback, you may contact @mudaafi\n\nAnonymous Feedback Form: https://docs.google.com/forms/d/e/1FAIpQLSefdKcoe_g_eoO8YLz9FVkNVThtsQ2DLv7KWsv63d0kqyqNAA/viewform?usp=sf_link`,
        )

      default:
        if (_identifyCommand('/join', message.text)) {
          let payload = message.text.replace('/join', '').trim()
          if (payload == '')
            return sendMessage(
              TELE_BOT_KEY,
              message.from.id,
              'Please use /join with a room number! E.g. /join 1234',
            )
          return joinRoom(message.from.id.toString(), payload)
        }
    }
  }
  // None of the above
  await broadcastToUserGroup(message.from.id.toString(), message)
}

// --- Start of Logic
export async function joinRoom(userId: string, room: string) {
  let res = await updateRoomInDb(userId, room)
  if (res == DatabaseResponse.FAILED_TO_JOIN_ROOM) {
    await sendMsg(userId, `Error Joining Room ${room}`)
    throw new Error(`User: ${userId} failed to join room: ${room}`)
  }
  await sendMsg(userId, `You have joined Room: <b>${room}</b>`)
  let users = await getNearbyUsers(userId)
  for (var id of users) {
    if (id != userId)
      await sendMsg(id, `<b>ℹ Room ${room}</b>\nA new user has joined!`)
  }
}

async function broadcastToUserGroup(userId: string, msgObj: TeleMessage) {
  let users = await getNearbyUsers(userId)
  if (users.length <= 1) {
    return sendMsg(
      userId,
      "You're alone in this room y'know...just thought you should know.",
    )
  }
  for (var id of users) {
    if (id != userId) await forwardMessage(TELE_BOT_KEY, userId, id, msgObj)
  }
}

async function processDevCommands(message: TeleMessage) {
  if (!message.text) return
  if (_identifyCommand('/move', message.text)) {
    let userId = message.text.split(' ')[1]
    let room = message.text.split(' ')[2]
    return joinRoom(userId, room)
  }
}

// --- End of Logic

export async function processTeleError(prompt: TeleUpdate, errorMsg: Error) {
  await sendMessage(TELE_BOT_KEY, DEV_ID, `<b>Error encountered</b>:`)
  await sendMessage(TELE_BOT_KEY, DEV_ID, JSON.stringify(prompt))
  await sendMessage(TELE_BOT_KEY, DEV_ID, `${errorMsg.message}`)
}

function _identifyCommand(command: string, textMsg: string) {
  return textMsg.indexOf(command) >= 0
}

// Wrapper Function
async function sendMsg(
  chat_id: string | number,
  text: string,
  reply_markup?: TeleInlineKeyboard | TeleReplyKeyboard,
) {
  sendMessage(TELE_BOT_KEY, chat_id, text, reply_markup)
}
