const axios = require("axios");

function restrictChatMember(chat_id, user_id, permissions, bot_key) {
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot" + bot_key + "/restrictChatMember",
      {
        chat_id: chat_id,
        user_id: user_id,
        permissions: permissions,
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log("Chat member restricted: " + user_id + " from chat: " + chat_id + " " + JSON.stringify(permissions));
      resolve();
      return;
      //res.end("ok");
    })
    .catch(err => {
      if (err.response && err.response.data.description == 'Bad Request: chat not found') {
        console.log("Chat not found when restricting user ( " + user_id + ") from chat: " + chat_id)
        resolve("chat_id error");
      } else if (err.response && err.response.data.description == "Bad Request: can't remove chat owner") {
        console.log("Cannot restrict Owner of group: " + user_id);
        resolve("owner restrict error");
      } else if (err.response && err.response.data.description == "Bad Request: user not found") {
        console.log("User not in group: " + user_id);
        resolve("user missing error");
      } else if (err.response && err.response.data.description == "Bad Request: method is available only for supergroups") {
        console.log("Group is not a supergroup: " + chat_id);
        resolve("supergroup error");
      } else {
        console.log("Error :", err);
        //res.end("Error :" + err);
        resolve("Not ok");
      }
    });
  })
}

function genChatPermissions(msgs=false, media=false, polls=false, msgs_other=false,
                            web=false, info=false, invite=false, pin=false) {
  return {
    can_send_messages: msgs,
    can_send_media_messages: media,
    can_send_polls: polls,
    can_send_other_messages: msgs_other,
    can_add_web_page_previews: web,
    can_change_info: info,
    can_invite_users: invite,
    can_pin_messages: pin,
  };
}

function unbanChatMemeber(chat_id, user_id, bot_key) {
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot"+ bot_key + "/unbanChatMember",
      {
        chat_id: chat_id,
        user_id: user_id,
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log("Chat member unbanned: " + user_id + " from chat: " + chat_id);
      resolve();
      return;
      //res.end("ok");
    })
    .catch(err => {
      if (err.response && err.response.data.description == 'Bad Request: chat not found') {
        console.log("Error unbanning user ( " + user_id + ") from chat: " + chat_id)
        resolve("chat_id error");
        return;
      }
      console.log("Error :", err);
      //res.end("Error :" + err);
      resolve("Not ok");
      return;
    });
  })
}

function kickChatMember(chat_id, user_id, bot_key) {
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot"+ bot_key + "/kickChatMember",
      {
        chat_id: chat_id,
        user_id: user_id,
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log("Chat member kicked: " + user_id + " from chat: " + chat_id);
      resolve();
      return;
      //res.end("ok");
    })
    .catch(err => {
      if (err.response && err.response.data.description == 'Bad Request: chat not found') {
        console.log("Error kicking user ( " + user_id + ") from chat: " + chat_id)
        resolve("chat_id error");
        return;
      } else if (err.response && err.response.data.description == "Bad Request: can't remove chat owner") {
        console.log("Cannot kick Owner of group: " + user_id);
        resolve("owner kick error");
        return;
      }
      console.log("Error :", err);
      //res.end("Error :" + err);
      resolve("Not ok");
      return;
    });
  })
}

function deleteMessage(chat_id, msg_id, bot_key) {
    return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot"+ bot_key + "/deleteMessage",
      {
        chat_id: chat_id,
        message_id: msg_id
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      const msgDetails = response.data.result;
      console.log("Message Deleted: (id: " + msg_id + ")");
      resolve("Success");
      return;
      //res.end("ok");
    })
    .catch(err => {
      if (err.response && err.response.data.description == 'Not Found') {
        console.log("Check if bot_key is provided.");
        resolve('not found');
        return;
      }
      if (err.response && err.response.data.description == 'Bad Request: message to delete not found') {
        console.log("Message id: " + msg_id + " has already been deleted");
        resolve('done');
        return;
      }
      // ...and here if it was not
      console.log("Error :", err);
      //res.end("Error :" + err);
      resolve("Not ok");
      return;
    });
  })
}

// Generates Telegram Chat Invitation Link
function getChatInviteLink(id, bot_key) {
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot"+ bot_key + "/exportChatInviteLink",
      {
        chat_id: id,
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      const invLink = response.data.result;
      console.log("Invite Link: " + invLink);
      resolve(invLink);
      return;
      //res.end("ok");
    })
    .catch(err => {
      if (err.response && err.response.data.description == 'Bad Request: not enough rights to export chat invite link') {
        resolve("Admin Rights Error");
        return;
      }
      console.log("Error :", err);
      //res.end("Error :" + err);
      resolve("Not ok");
      return;
    });
  })
}

// Generates the Telegram parameter for Inline Keyboard Markup
// @params buttonArr An array of rows containing an array of button labels (rows, cols)
// @params callbackArr A single array of callback data matching buttonArr (for each row, for each col)
function genInlineButtons(buttonArr, callbackArr) {
  var result = []
  var counter = 0;
  for (var i=0; i < buttonArr.length; ++i) {
    var rowArr = []
    for (var buttonLabel of buttonArr[i]) {
      rowArr.push({
        text: buttonLabel,
        callback_data: callbackArr[counter],
      });
      counter += 1;
    }
    result.push(rowArr);
  }
  return JSON.stringify({inline_keyboard: result});
}

// Generates the Telegram parameter for Inline Keyboard Markup
// @params buttonArr An array of rows containing an array of button labels (rows, cols)
// @params callbackArr A single array of callback data matching buttonArr (for each row, for each col)
// @params urlArr A single array of url links matching buttonArr (for each row, for each col)
function genInlineUrlButtons(buttonArr, callbackArr, urlArr) {
  var result = []
  var counter = 0;
  for (var i=0; i < buttonArr.length; ++i) {
    var rowArr = []
    for (var buttonLabel of buttonArr[i]) {
      rowArr.push({
        text: buttonLabel,
        callback_data: callbackArr[counter],
        url: urlArr[counter],
      });
      counter += 1;
    }
    result.push(rowArr);
  }
  return JSON.stringify({inline_keyboard: result});
}

function updateMessage(chat_id, msg_id, text, reply_markup, bot_key) {
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot"+ bot_key + "/editMessageText",
      {
        chat_id: chat_id,
        message_id: msg_id,
        text: text,
        parse_mode: "HTML",
        reply_markup: reply_markup
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      const msgDetails = response.data.result;
      console.log("Message Updated (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
      //res.end("ok");
    })
    .catch(err => {
      if (err.response && err.response.data.description == 'Bad Request: message to edit not found') {
        console.log("TempMsgRecords contains outdated data (" + chat_id + ", " + msg_id + ")");
        resolve("msg missing");
        return;
      } else if (err.response && err.response.data.description == "Bad Request: message can't be edited") {
        console.log("Weird Update Msg Error (" + chat_id + ", " + msg_id + ")");
        resolve("update msg error");
        return;
      } else if (err.response && err.response.data.description == 'Bad Request: chat_id is empty') {
        console.log("You didn't pass in a chatId!\nText: " + text);
        resolve("missing chat_id");
        return;
      } else if (err.response && err.response.data.description ==  'Bad Request: message is not modified: specified new ' +
                                                                    'message content and reply markup are exactly the same ' +
                                                                    'as a current content and reply markup of the message') {
        console.log("Message already updated: " + text);
        resolve("msg updated");
        return;
      } else if (err.response && err.response.data.description ==  'Bad Request: not Found') {
        console.log("Message has already been delted: " + text);
        resolve("msg deleted");
        return;
      }
      // ...and here if it was not
      console.log("Error :", err);
      //res.end("Error :" + err);
      resolve("Not ok");
      return;
    });
  })
}

// @params srcId ID of telegram user who sent the message
// @params destId ID of telegram user to forward message to
// @params message req.body.message (or equivalent) received from bot
// @params bot_key the BOT_KEY used as in env
function forwardMsg(srcId, destId, message, bot_key) {
  // Identifying Message Type
  if (message.reply_markup || message.poll) {
    sendMessage(srcId, "Sorry, polls and such are not allowed as of yet :(", {}, bot_key);
  } else if (message.text) {
    // malice removals
    var textMsg = cleanseString(message.text);
    textMsg = textMsg.replace(/\"/g,"'");
    return sendMessage(destId, textMsg, {}, bot_key)
  } else if (message.sticker) {
    var sticker = message.sticker;
    return sendSticker(destId, sticker, bot_key);
  } else if (message.photo) {
    var photo = message.photo[0];
    return sendPhoto(destId, photo.file_id, cleanseString(message.caption), bot_key);
  } else if (message.video) {
    var video = message.video;
    return sendVideo(destId, video.file_id, cleanseString(message.caption), bot_key);
  } else if (message.video_note) {
    var videoNote = message.video_note;
    return sendVideoNote(destId, videoNote.file_id, bot_key);
  } else if (message.voice) {
    var voice = message.voice;
    return sendVoice(destId, voice.file_id, cleanseString(message.caption), bot_key);
  } else if (message.document) {
    var doc = message.document;
    return sendDocument(destId, doc.file_id, bot_key);
  } else if (message.audio) {
    var audio = message.audio;
    return sendAudio(destId, audio.file_id, cleanseString(message.caption), bot_key);
  } else {
    console.log("Unidentifiable Type");
    console.log(message);
  }
}

function sendAudio(id, audio, caption, bot_key) {
  return new Promise((resolve, reject) => {
    axios.post(
      "https://api.telegram.org/bot"+ bot_key + "/sendAudio",
      {
        chat_id: id,
        audio: audio,
        caption: caption,
        parse_mode: "HTML"
      }
    ).then(response => {
      const msgDetails = response.data.result;
      console.log("Audio posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
    }).catch(err => {
      console.log("ERROR: ", err);
      resolve("Not ok");
      return;
    })
  })
}

function sendDocument(id, doc, bot_key) {
  return new Promise((resolve, reject) => {
    axios.post(
      "https://api.telegram.org/bot"+ bot_key + "/sendDocument",
      {
        chat_id: id,
        document: doc
      }
    ).then(response => {
      const msgDetails = response.data.result;
      console.log("Document posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
    }).catch(err => {
      console.log("ERROR: ", err);
      resolve("Not ok");
      return;
    })
  })
}

function sendVoice(id, voice, caption, bot_key) {
  return new Promise((resolve, reject) => {
    axios.post(
      "https://api.telegram.org/bot"+ bot_key + "/sendVoice",
      {
        chat_id: id,
        voice: voice,
        caption: caption,
        parse_mode: "HTML"
      }
    ).then(response => {
      const msgDetails = response.data.result;
      console.log("Voice posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
    }).catch(err => {
      console.log("ERROR: ", err);
      resolve("Not ok");
      return;
    })
  })
}

function sendVideoNote(id, videoNote, bot_key) {
  return new Promise((resolve, reject) => {
    axios.post(
      "https://api.telegram.org/bot"+ bot_key + "/sendVideoNote",
      {
        chat_id: id,
        video_note: videoNote,
      }
    ).then(response => {
      const msgDetails = response.data.result;
      console.log("Video Note posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
    }).catch(err => {
      console.log("ERROR: ", err);
      resolve("Not ok");
      return;
    })
  })
}

function sendVideo(id, video, caption, bot_key) {
  return new Promise((resolve, reject) => {
    axios.post(
      "https://api.telegram.org/bot"+ bot_key + "/sendVideo",
      {
        chat_id: id,
        video: video,
        caption: caption,
        parse_mode: "HTML"
      }
    ).then(response => {
      const msgDetails = response.data.result;
      console.log("Video posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
    }).catch(err => {
      console.log("ERROR: ", err);
      resolve("Not ok");
      return;
    })
  })
}

function sendPhoto(id, photo, caption, bot_key) {
  return new Promise((resolve, reject) => {
    axios.post(
      "https://api.telegram.org/bot"+ bot_key + "/sendPhoto",
      {
        chat_id: id,
        photo: photo,
        caption: caption,
        parse_mode: "HTML"
      }
    ).then(response => {
      const msgDetails = response.data.result;
      console.log("Photo posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
    }).catch(err => {
      console.log("ERROR: ", err);
      resolve("Not ok");
      return;
    })
  })
}

function sendSticker(id, sticker, bot_key) {
  return new Promise((resolve, reject) => {
    axios.post(
      "https://api.telegram.org/bot"+ bot_key + "/sendSticker",
      {
        chat_id: id,
        sticker: sticker.file_id
      }
    ).then(response => {
      const msgDetails = response.data.result;
      console.log("Sticker posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
    }).catch(err => {
      console.log("ERROR: ", err);
      resolve("Not ok");
      return;
    })
  })
}

function sendMessage(id, text, reply_markup, bot_key) {
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot" + bot_key + "/sendMessage",
      {
        chat_id: id,
        text: text,
        parse_mode: "HTML",
        reply_markup: reply_markup
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      const msgDetails = response.data.result;
      console.log("Message posted (id: " + msgDetails.message_id + ")");
      resolve(msgDetails);
      return;
      //res.end("ok");
    })
    .catch(err => {
      if (err.response && err.response.data.description == 'Forbidden: bot was blocked by the user') {
        console.log("User Blocked The Bot! (" + id + ")" + "\nText: " + text);
        resolve({msg: "blocked", arg: id});
        return;
      }
      // ...and here if it was not
      console.log("Error: " + err);
      //res.end("Error :" + err);
      resolve("Not ok");
      return;
    });
  })
}

function leaveChat(chat_id, bot_key) {
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://api.telegram.org/bot"+ bot_key + "/leaveChat",
      {
        chat_id: chat_id,
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log("Left Chat: " + chat_id);
      resolve();
      return;
    })
    .catch(err => {
      if (err.response && err.response.data.description == '?') {
        console.log("Error Leaving Chat: " + chat_id)
        resolve("chat_id error");
        return;
      }
      console.log("Error :", err);
      resolve("Not ok");
      return;
    });
  })
}

//--- Wrapper Functions


//--- Formating Functions

// Amend the text to include HTML formatting
// links are not supported bc i'm lazy
// @params textMsg text containing html markup such as <b>
// @params formatting [{0: offsetFromStart, 1: length, 2: formatType}]
function convertToHTML(textMsg, formatting) {
  if (!formatting) return textMsg;
  // Converts from array of objects to array of arrays
  var sortedFormatting = [];
  for (format of formatting) {
    sortedFormatting.push(Object.values(format));
    //console.log();
  }
  // https://stackoverflow.com/questions/50415200/sort-an-array-of-arrays-in-javascript
  sortedFormatting.sort(function(a, b) {
    if (a[0] == b[0]) {
      return a[1] - b[1];
    }
    return a[0] - b[0];
  });
  var reference = [];
  var delimeterFront = "";
  var delimeterEnd = "";
  for (var format of sortedFormatting) {
    // Decide the delimeter
    switch (format[2]) {
      case "bold":
        delimeterFront = "<b>"
        delimeterEnd = "</b>"
        break;
      case "italic":
        delimeterFront = "<i>"
        delimeterEnd = "</i>"
        break;
      case "underline":
        delimeterFront = "<u>"
        delimeterEnd = "</u>"
        break;
      case "code":
        delimeterFront = "<code>"
        delimeterEnd = "</code>"
        break;
      case "strikethrough":
        delimeterFront = "<s>"
        delimeterEnd = "</s>"
        break;
      case "text_link":
        delimeterFront = "<a href=\"" + format[3] + "\">"
        delimeterEnd = "</a>"
        break;
      default:
        delimeterFront = "";
        delimeterEnd = "";
    }
    var start = format[0];
    var end = format[0] + format[1]; // non-inclusive

    // Amend the indexes due to past edits
    var startCopy = start;
    var endCopy = end;
    for (var i = 0; i < reference.length; ++i) {
      var x = reference[i];
      if (start > x[0] || (start == x[0] && x[2] == "tail") ) {
        startCopy += x[1].length;
      }
      if (end > x[0] || (end == x[0] && start == reference[i-1][0])) {
        endCopy += x[1].length;
      }
    }

    // Amend the texts
    var msgCopy = textMsg;
    msgCopy = textMsg.slice(0, startCopy) + delimeterFront;
    msgCopy += textMsg.slice(startCopy, endCopy) + delimeterEnd;
    msgCopy += textMsg.slice(endCopy);
    textMsg = msgCopy;

    // Track the new edits
    reference.push([start, delimeterFront, "head"]); 
    reference.push([end, delimeterEnd, "tail"]);
  }
  return textMsg;
}

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  if (!string) return;
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

module.exports = {
  genInlineButtons: genInlineButtons,
  genInlineUrlButtons: genInlineUrlButtons,
  cleanseString: cleanseString,
  convertToHTML: convertToHTML,
  sendMessage: sendMessage,
  updateMessage: updateMessage,
  getChatInviteLink: getChatInviteLink,
  sendPhoto: sendPhoto,
  sendVideo: sendVideo,
  deleteMessage: deleteMessage,
  kickChatMember: kickChatMember,
  leaveChat: leaveChat,
  unbanChatMemeber: unbanChatMemeber,
  genChatPermissions: genChatPermissions,
  restrictChatMember: restrictChatMember,
  forwardMsg: forwardMsg,
}
