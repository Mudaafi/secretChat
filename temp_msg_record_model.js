class TempMsgRecord {
  static getDbParams() { 
    const params = {id: "INTEGER", ref: "TEXT", user_id: "TEXT", msg_id: "INTEGER", bot: "TEXT", type: "TEXT"};
    return params;
  }
  
  constructor(ref="ERORR", user_id="ERROR", msg_id=-1, bot_name="ERROR", type="no type") {
    this.user_id = user_id;
    this.ref = ref;
    this.msg_id = msg_id;
    this.bot = bot_name;
    this.type = type;
  }
  
  // Required Method to translate into SQL friendly values 
  getValues() {
    var values = Object.values(this).map((value) => {
      if (value == null) {
        return "null"; 
      } else if (isNaN(parseFloat(value))) {
        return '"' + value + '"';
      } else if (parseFloat(value).toString().length != value.toString().length) {
        return '"' + value + '"';
      } else {
        return value;
      }
    })
    return Promise.all(values);
  }
}

module.exports = TempMsgRecord;