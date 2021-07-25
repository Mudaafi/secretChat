import axios from 'axios'
import {
  TeleResponse,
  convertError,
  TeleInlineKeyboardButton,
  TeleInlineKeyboard,
  TeleMessageEntities,
  TeleReplyKeyboard,
  TeleBotCommand,
  TeleBotCommandScope,
  TeleMessage,
} from './tele-types'

const TELE_API = 'https://api.telegram.org/bot'

/**
 * Sends a http response back to the Bot to acknowledge a CallbackQuery
 * Required for better UI/UX
 * @param bot_key string
 * @param callback_query_id string referencing a callback_query
 * @param text string to be shown to user as notification/alert
 * @param show_alert boolean
 */
export async function answerCallbackQuery(
  bot_key: string,
  callback_query_id: string,
  text: string,
  show_alert: boolean,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post<TeleResponse>(TELE_API + bot_key + '/answerCallbackQuery', {
        callback_query_id: callback_query_id,
        text: text,
        show_alert: show_alert,
      })
      .then((res) => {
        console.log(`Callback ${callback_query_id}`)
        resolve(res.data)
      })
      .catch((err) => {
        let convertedError = convertError(err)
        convertedError.errorDescription = 'default'
        reject(convertedError)
      })
  })
}

/**
 * Sends a message via the bot
 * @param bot_key
 * @param chat_id
 * @param text
 * @param reply_markup
 * @returns
 */
export async function sendMessage(
  bot_key: string,
  chat_id: number | string,
  text: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendMessage', {
        chat_id: chat_id,
        text: text,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Message posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Deletes a message
 * Bot must be an admin in a group (see other reqs: https://core.telegram.org/bots/api#deletemessage)
 * @param bot_key string
 * @param chat_id integer
 * @param msg_id integer
 */
export async function deleteMessage(
  bot_key: string,
  chat_id: number,
  msg_id: number,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/deleteMessage', {
        chat_id,
        message_id: msg_id,
      })
      .then((res) => {
        console.log(`Message Deleted [chat: ${chat_id}]: (msg_id: ${msg_id})})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Generates the Telegram parameter for Inline Keyboard Markup
 * @param buttonArr array of rows containing an array of button labels (rows, cols)
 * @param callbackArr single array of callback data matching buttonArr (for each row, for each col)
 * @returns  Parameter Object for posting Inline (callback_query) Buttons
 */
export function genInlineButtons(
  buttonArr: Array<Array<string>>,
  callbackArr: Array<string>,
) {
  var result = []
  var counter = 0
  for (var i = 0; i < buttonArr.length; ++i) {
    var rowArr = []
    for (var buttonLabel of buttonArr[i]) {
      rowArr.push({
        text: buttonLabel,
        callback_data: callbackArr[counter],
      } as TeleInlineKeyboardButton)
      counter += 1
    }
    result.push(rowArr)
  }
  return { inline_keyboard: result } as TeleInlineKeyboard
}

/**
 * Generates the Telegram parameter for Inline Keyboard Markup
 * @param buttonArr array of rows containing an array of button labels (rows, cols)
 * @param callbackArr single array of callback data matching buttonArr (for each row, for each col)
 * @param urlArr single array of url links matching buttonArr (for each row, for each col)
 * @returns Telegram Parameter Object for posting Inline Url Buttons
 */
export function genInlineUrlButtons(
  buttonArr: Array<Array<string>>,
  callbackArr: Array<string>,
  urlArr: Array<string>,
) {
  var result = []
  var counter = 0
  for (var i = 0; i < buttonArr.length; ++i) {
    var rowArr = []
    for (var buttonLabel of buttonArr[i]) {
      rowArr.push({
        text: buttonLabel,
        callback_data: callbackArr[counter],
        url: urlArr[counter],
      } as TeleInlineKeyboardButton)
      counter += 1
    }
    result.push(rowArr)
  }
  return { inline_keyboard: result } as TeleInlineKeyboard
}

/**
 * Updates a message
 * @param bot_key string
 * @param chat_id integer
 * @param msg_id integer
 * @param text string
 * @param reply_markup Telegram Object
 */
export async function updateMessage(
  bot_key: string,
  chat_id: number,
  msg_id: number,
  text: string,
  reply_markup: TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/editMessageText', {
        chat_id: chat_id,
        message_id: msg_id,
        text: text,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        console.log(`Message Updated (id: ${res.data.result.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Sends a photo via the bot
 * @param bot_key string
 * @param chat_id integer | string
 * @param photo string url of photo
 * @param caption string
 */
export async function sendPhoto(
  bot_key: string,
  chat_id: number | string,
  photo: string,
  caption: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendPhoto', {
        chat_id: chat_id,
        photo: photo,
        caption: caption,
        reply_markup: reply_markup,
        parse_mode: 'HTML',
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Photo posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

export async function sendSticker(
  bot_key: string,
  chat_id: number | string,
  sticker: string,
  reply_to_message_id?: number,
  allow_sending_without_reply: boolean = true,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendSticker', {
        chat_id: chat_id,
        sticker: sticker,
        reply_to_message_id: reply_to_message_id,
        allow_sending_without_reply: allow_sending_without_reply,
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Sticker posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

export async function sendVideo(
  bot_key: string,
  chat_id: number | string,
  video: string,
  caption?: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendVideo', {
        chat_id: chat_id,
        video: video,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Video posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

export async function sendVideoNote(
  bot_key: string,
  chat_id: number | string,
  video_note: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendVideoNote', {
        chat_id: chat_id,
        video: video_note,
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`VideoNote posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

export async function sendVoice(
  bot_key: string,
  chat_id: number | string,
  voice: string,
  caption?: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendVoice', {
        chat_id: chat_id,
        voice: voice,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Voice posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

export async function sendDocument(
  bot_key: string,
  chat_id: number | string,
  document: string,
  caption?: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendDocument', {
        chat_id: chat_id,
        document: document,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Document posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

export async function sendAudio(
  bot_key: string,
  chat_id: number | string,
  audio: string,
  caption?: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendAudio', {
        chat_id: chat_id,
        audio: audio,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Document posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

export async function sendPoll(
  bot_key: string,
  chat_id: number | string,
  question: string,
  options: Array<string>,
  is_anonymous: boolean = true,
  type: string = 'regular',
  allows_multiple_answers: boolean = false,
  correct_option_id: number = 0,
  explanation?: string,
  open_period?: number,
  close_date?: number,
  is_closed?: boolean,
  disable_notification: boolean = false,
  reply_to_message_id?: number,
  allow_sending_without_reply?: boolean,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendPoll', {
        chat_id: chat_id,
        question: question,
        options: options,
        is_anonymous: is_anonymous,
        type: type,
        allows_multiple_answers: allows_multiple_answers,
        correct_option_id: correct_option_id,
        explanation: explanation,
        open_period: open_period,
        close_date: close_date,
        is_closed: is_closed,
        disable_notification: disable_notification,
        reply_to_message_id: reply_to_message_id,
        allow_sending_without_reply: allow_sending_without_reply,
        reply_markup: reply_markup,
        explanation_parse_mode: 'HTML',
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Poll posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Forwards a message manually
 * @param bot_key string
 * @param srcId integer | string Telegram id of user who sent the message
 * @param destId integer | string Telegram id of user to forward message to
 * @param message TeleMessage object to be forwarded
 * @returns
 */
export async function forwardMessage(
  bot_key: string,
  srcId: number | string,
  destId: number | string,
  message: TeleMessage,
) {
  let textMsg = ''
  // If reply
  if (message.reply_to_message)
    textMsg = `<b>in reply to:</b> <i>${message.reply_to_message.text}</i>\n\n`
  let caption = ''
  if (message.caption)
    caption = convertToHTML(
      cleanseString(message.caption || '') || '',
      message.caption_entities,
    )

  // Identifying Message Type
  if (message.text) {
    textMsg = `${textMsg}${convertToHTML(
      cleanseString(message.text) || '',
      message.entities,
    )}`
    return sendMessage(bot_key, destId, textMsg, message.reply_markup)
  } else if (message.sticker) {
    if (message.reply_to_message) await sendMessage(bot_key, destId, textMsg)
    return sendSticker(bot_key, destId, message.sticker.file_id)
  } else if (message.photo) {
    var photo = message.photo[0]
    return sendPhoto(
      bot_key,
      destId,
      photo.file_id,
      `${textMsg}${caption}`,
      message.reply_markup,
    )
  } else if (message.video) {
    var video = message.video
    return sendVideo(
      bot_key,
      destId,
      video.file_id,
      `${textMsg}${caption}`,
      message.reply_markup,
    )
  } else if (message.video_note) {
    var videoNote = message.video_note
    return sendVideoNote(bot_key, destId, videoNote.file_id)
  } else if (message.voice) {
    var voice = message.voice
    return sendVoice(
      bot_key,
      destId,
      voice.file_id,
      `${textMsg}${caption}`,
      message.reply_markup,
    )
  } else if (message.document) {
    var doc = message.document
    return sendDocument(
      bot_key,
      destId,
      doc.file_id,
      `${textMsg}${caption}`,
      message.reply_markup,
    )
  } else if (message.audio) {
    var audio = message.audio
    return sendAudio(
      bot_key,
      destId,
      audio.file_id,
      `${textMsg}${caption}`,
      message.reply_markup,
    )
  } else {
    console.log('Unidentifiable Type')
    console.log(message)
    return sendMessage(
      bot_key,
      srcId,
      'Sorry, this feature is not supported yet :(',
    )
  }
}

export async function setMyCommands(
  bot_key: string,
  commands: Array<TeleBotCommand>,
  scope: TeleBotCommandScope,
  language_code?: string,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/setMyCommands', {
        commands: commands,
        scope: scope,
        language_code: language_code,
      })
      .then((res) => {
        console.log(`Commands Updated (id: ${res.data.result.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

//--- Formating Functions

/**
 * Converts Telegram's formats of the text to include HTML formatting
 * Created when I was using javascript and didn't know the below enums
 * enum: mention/hashtag/bot_command/url/email/phone_number/bold/italic/underline/strikethrough/code/pre/text_link/text_mention
 * @param textMsg text containing html markup such as <b>
 * @param formatting formatting [{0: offsetFromStart, 1: length, 2: formatType}]
 */
export function convertToHTML(
  textMsg: string,
  formatting?: [TeleMessageEntities],
) {
  if (!formatting) return textMsg
  // Converts from array of objects to array of arrays
  var sortedFormatting = [] as any
  for (format of formatting) {
    sortedFormatting.push(Object.values(format))
    //console.log();
  }
  // https://stackoverflow.com/questions/50415200/sort-an-array-of-arrays-in-javascript
  sortedFormatting.sort(function (a: any, b: any) {
    if (a[0] == b[0]) {
      return a[1] - b[1]
    }
    return a[0] - b[0]
  })
  var reference = []
  var delimeterFront = ''
  var delimeterEnd = ''
  for (var format of sortedFormatting) {
    // Decide the delimeter
    switch (format[2]) {
      case 'bold':
        delimeterFront = '<b>'
        delimeterEnd = '</b>'
        break
      case 'italic':
        delimeterFront = '<i>'
        delimeterEnd = '</i>'
        break
      case 'underline':
        delimeterFront = '<u>'
        delimeterEnd = '</u>'
        break
      case 'code':
        delimeterFront = '<code>'
        delimeterEnd = '</code>'
        break
      case 'strikethrough':
        delimeterFront = '<s>'
        delimeterEnd = '</s>'
        break
      case 'text_link':
        delimeterFront = '<a href="' + format[3] + '">'
        delimeterEnd = '</a>'
        break
      default:
        delimeterFront = ''
        delimeterEnd = ''
    }
    var start = format[0]
    var end = format[0] + format[1] // non-inclusive

    // Amend the indexes due to past edits
    var startCopy = start
    var endCopy = end
    for (var i = 0; i < reference.length; ++i) {
      var x = reference[i]
      if (start > x[0] || (start == x[0] && x[2] == 'tail')) {
        startCopy += x[1].length
      }
      if (end > x[0] || (end == x[0] && start == reference[i - 1][0])) {
        endCopy += x[1].length
      }
    }

    // Amend the texts
    var msgCopy = textMsg
    msgCopy = textMsg.slice(0, startCopy) + delimeterFront
    msgCopy += textMsg.slice(startCopy, endCopy) + delimeterEnd
    msgCopy += textMsg.slice(endCopy)
    textMsg = msgCopy

    // Track the new edits
    reference.push([start, delimeterFront, 'head'])
    reference.push([end, delimeterEnd, 'tail'])
  }
  return textMsg
}

// helper function that prevents html/css/script malice
export const cleanseString = function (string: string): string | undefined {
  if (!string) return
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
