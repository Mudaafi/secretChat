// This js file is an extension to the multi-purpose telegram_interface js file
// meant for this game in particular
const Config = require('./config.js');
const tele = require('./telegram_interface.js');
const DatabaseInterface = require('./database_interface.js');
const Record = require('./record_model.js');
const TeleUser = require('./telegram_user_model.js');
const TempMsgRecord = require('./temp_msg_record_model.js');

let botKey = Config.getBotKey();

class TelegramExtension {
  constructor(dbInterface) {
    this.dbInterface = dbInterface;
    // idk what to use
    this.CALLBACK_DELIMETER = "<>";
  }
  
  async processTeleMsg(message) {
    var id = message.from.id;
    var chatId = message.chat.id;
    var formatting = message.entities;
    if (chatId != id) return; // From a group, ignore
    // malice removal
    var textMsg = this.tele.cleanseString(textMsg);
    textMsg = textMsg.replace(/\"/g,"'");
    // Polls not supported
    if (formatting) { 
      textMsg = this.tele.convertToHTML(textMsg, formatting);
    }
    // -- Commands
    // Start/registration
    if (this.identifyCommand("/start", textMsg)) {
      var newUser = new TeleUser(id);
      await this.dbInterface.addEntry("Users", newUser);
      tele.sendMessage(id, "/join a room!", {}, Config.getBotKey());
    } else if (this.identifyCommand("/join", textMsg)) {
      var msg = textMsg.split("/join")[1];
      this.joinGrp(id, msg);
    } else {
      this.sendGroup(id, message);
    }
  }
  
  async sendGroup(id, msgObj) {
    var grpId = await this.dbInterface.findMatchingEntry("Users", {user_id: id});
    if (grpId == "no grp") {
      tele.sendMessage(id, "You are not in a room. /join room_number");
      return;
    }
    var users = await this.dbInterface.findAllMatchingEntries("Users", {group_id: grpId});
    for (var user of users) {
      tele.forwardMsg(id, user.user_id, msgObj, botKey);
    }
  }
  
  async joinGrp(id, grpId) {
    this.dbInterface.updateEntries("Users", {group_id: grpId}, {user_id: id}); 
    var msg = "You have registered for Room: " + grpId;
    tele.sendMessage(id, msg, {}, Config.getBotKey());
  }
  
  identifyCommand(command, textMsg) {
    return textMsg.indexOf(command) >= 0;
  }
}

module.exports = TelegramExtension;