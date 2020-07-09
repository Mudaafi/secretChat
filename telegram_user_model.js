class TeleUser {
  static getDbParams() { 
    const params = {id: "INTEGER", user_id: "TEXT", first_name: "TEXT", username: "TEXT", role: "TEXT", group_id: "TEXT"};
    return params;
  }
  
  constructor(user_id="no id", first_name="no first name", username="no username", role="no role", group_id="no grp") {
    this.user_id = user_id;
    this.first_name = first_name;
    this.username = username;
    this.role = role;
    this.group_id = group_id;
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

module.exports = TeleUser;