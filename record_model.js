class Record {
  static getDbParams() { 
    const params = {id: "INTEGER", user_id: "TEXT", first_name: "TEXT", username: "TEXT", message: "TEXT", msg_id: "INTEGER"};
    return params;
  }
  
  constructor(user_id="no id", first_name="no first name", username="no username", message="no msg", msg_id=-1) {
    this.user_id = user_id;
    this.first_name = first_name;
    this.username = username;
    this.message = message; 
    this.msg_id = msg_id;
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

module.exports = Record;