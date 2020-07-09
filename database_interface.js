const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const Record = require('./record_model.js'); // Basic Telegram record model
const TeleUser = require('./telegram_user_model.js') // Basic Telegram user model
const TempMsgRecord = require('./temp_msg_record_model.js') // For msgs to update/delete

class DatabaseInterface {
  constructor(path="./.data/sqlite.db") {
    this.DB_PATH = path;
    this.dbExists = fs.existsSync(this.DB_PATH);
    this.db = new sqlite3.Database(this.DB_PATH);
    //-!! ADD NEW DATABASES HERE
    this.dbNames = ["Users", "Records", "TempMsgRecords",];
    this.dbParams = {
      "Users": TeleUser.getDbParams(),
      "Records": Record.getDbParams(),
      "TempMsgRecords": TempMsgRecord.getDbParams(),
    }
    this.initializeDb();
  }
  
  // Race condition possible here due to this.dbExists and createDb()
  initializeDb() {
    this.db.parallelize(async() => {
      if (!this.dbExists) {
        for (var i=0; i < this.dbNames.length; ++i) {
          var dbName = this.dbNames[i];
          await this.createDb(dbName, this.dbParams[dbName]);
        }
        this.dbExists = true;
        console.log("Databases " + this.dbNames + " created");
      } else { 
        //console.log("Database ready");
      } 
    });
  }
  
  async createDb(dbName, params) {
    // Assert Statements
    if (dbName == null) {
      console.log("Name of Database required for Creation");
      return;
    }
    if (this.dbExists && this.dbNames.includes(dbName)) {
      console.log("Database Name already in use");
      return;
    }
    if (params == null) {
      params = { 'id': 'INTEGER'};
    }
    // Converting into SQL Command
    var SQL_CREATE_DB_COMD = "CREATE TABLE " + dbName + " (" + Object.keys(params)[0] + " " + Object.values(params)[0] + " PRIMARY KEY";
    for (var i=1; i<Object.keys(params).length; ++i) {
      SQL_CREATE_DB_COMD += ", " + Object.keys(params)[i] + " " + Object.values(params)[i];
    }
    SQL_CREATE_DB_COMD += ")" 
    console.log(SQL_CREATE_DB_COMD);
    
    // Running SQL Command 
    this.db.run(SQL_CREATE_DB_COMD, (err) => {
      if (err) {
        console.log("Error creating " + dbName + " Database");
        console.log(err);
        return;
      }
      console.log("Created " + dbName + " Database");
      if (this.dbExists) {
        this.dbNames.push(dbName);
        this.dbParams[dbName] = params;
      }
      if (dbName == "Admins") {
        var me = new TeleUser("90554672", "Ahmad Mudaafi'", "mudaafi", 'admin', 'no grp');
        this.addEntry("Admins", me);
      }
    });
  }
  
  async deleteDb(dbName) {
    return new Promise((resolve, reject) => {
      this.db.run("DROP TABLE " + dbName, (err) => {
        if (err) {
          console.log("Error destroying Table");
          console.log(err);
          resolve('error');
        } else {
          console.log("DELETED TABLE " + dbName);
          this.dbNames.splice(this.dbNames.indexOf(dbName), 1);
          this.dbParams[dbName] = null;
          resolve('ok');
        }
      });
    });
  }
  
  async addEntry(dbName, entry) {
    let columns = Object.keys(entry).join(",");
    var values = await entry.getValues();
    values = values.join();
    const SQL_ADD_USER_COMD = 'INSERT INTO ' + dbName + ' (' + columns + ') VALUES (' + values + ')';
    //console.log(SQL_ADD_USER_COMD);
    return new Promise((resolve, reject) => {
      this.db.run(SQL_ADD_USER_COMD, (err) => {
        if (err) {
          console.log("Error Adding Entry: " + SQL_ADD_USER_COMD);
          console.log(err);
          resolve('error');
        } else {
          console.log("Added Entry " + SQL_ADD_USER_COMD);
          resolve('ok');
        }
      });
    });
  }
  
  async deleteEntry(dbName, params) {
    let keys = Object.keys(params);
    let values = Object.values(params);
    var conditionals = " WHERE " + keys[0] + " = " + values[0];
    for (var i=1; i < values.length; ++i) {
      conditionals += " AND " + keys[i] + " = " + values[i];
    }
    const SQL_DELETE_COMD = "DELETE FROM " + dbName + conditionals;
    //console.log(SQL_DELETE_COMD);
    return new Promise((resolve, reject) => {
      this.db.run(SQL_DELETE_COMD, (err) => {
        if (err) {
          console.log("Error deleting Entry: " + conditionals);
          console.log(err);
          resolve('error');
        } else {
          console.log("DELETED Entry in " + dbName + " " + conditionals);
          resolve('ok');
        }
      });
    });
  }
  
  // Updates all entryies that match conditionalMap
  // @params dbName Name of Database to be updated
  // @params updateMap Map of values to be set
  // @params conditionalMap Map of values to identify
  async updateEntries(dbName, updateMap, conditionalMap) {
    let setCols = Object.entries(updateMap);
    var setComd = " SET " + setCols[0][0] + " = '" + setCols[0][1] + "'";
    for (var i=1; i< setCols.length; ++i) {
      setComd += ", " + setCols[i][0] + " = '" + setCols[0][1] + "'";
    }
    if (conditionalMap) {
      let condCols = Object.entries(conditionalMap);
      var condComd = " WHERE " + condCols[0][0] + " = " + condCols[0][1];
      for (var i=1; i < condCols.length; ++i) {
        condComd += " AND " + condCols[i][0] + " = " + condCols[i][1];
      }
    } else {
      var condComd = '';
    }
    const SQL_UPDATE_COMD = "UPDATE " + dbName + setComd + condComd;
    console.log(SQL_UPDATE_COMD);
    this.db.run(SQL_UPDATE_COMD);
  }
  
  // @params params Map of database cols to values to be found
  // Returns one entry
  findMatchingEntry(dbName, params) {
    if (!dbName) {
      console.log("Please specify a database name");
      return;
    }
    return new Promise((resolve, reject) => {
      var keys = Object.keys(params);
      var values = Object.values(params);
      var conditionals = " WHERE " + keys[0] + " = " + values[0];
      for (var i=1; i < values.length; ++i) {
        conditionals += " AND " + keys[i] + " = " + values[i];
      }
      // Converting into SQL Command
      var SQL_QUERY_COMD = "SELECT DISTINCT * FROM " + dbName + conditionals;
      console.log(SQL_QUERY_COMD);
      this.db.all(SQL_QUERY_COMD, (err, rows) => {
        if (err) {
          console.log(err);
          console.log("Error getting rows from " + dbName);
          resolve();
          return;
        } else if (rows == null || rows.length <= 0) {
          console.log("No matching entry found in " + dbName + " Database");
          resolve();
          return;
        }
        resolve(rows[0]);
        return;
      });
    })
  }
  
  // @params params Map of database cols to values to be matched
  // Returns Array of Row Objects
  findAllMatchingEntries(dbName, params) {
    if (!dbName) {
      console.log("Please specify a database name");
      return;
    }
    return new Promise((resolve, reject) => {
      var keys = Object.keys(params);
      var values = Object.values(params);
      var conditionals = " WHERE " + keys[0] + " = " + values[0];
      for (var i=1; i < values.length; ++i) {
        conditionals += " AND " + keys[i] + " = " + values[i];
      }
      // Converting into SQL Command
      var SQL_QUERY_COMD = "SELECT * FROM " + dbName + conditionals;
      console.log(SQL_QUERY_COMD);
      this.db.all(SQL_QUERY_COMD, (err, rows) => {
        if (err) {
          console.log(err);
          console.log("Error getting rows from " + dbName);
          resolve();
          return;
        } else if (rows == null || rows.length <= 0) {
            console.log("No matching ENTRIES found in " + dbName + " Database");
            resolve();
            return;
        }
        resolve(rows);
        return;
      });
    })
  }
  
  // @params colName String of column name
  // returns Array
  async getCol(dbName, colName) {
    if (!dbName) {
      console.log("Please specify a database name");
      return;
    }
    var result = [];
    return new Promise((resolve, reject) => {
      // Converting into SQL Command
      var SQL_QUERY_COMD = "SELECT " + colName + " FROM " + dbName;
      console.log(SQL_QUERY_COMD);
      this.db.all(SQL_QUERY_COMD, (err, rows) => {
        if (err) {
          console.log(err);
          console.log("Error getting rows from " + dbName);
          resolve(result);
          return;
        } else if (rows == null || rows.length <= 0) {
            console.log("No matching entries found in " + dbName + " Database");
            resolve(result);
            return;
        }
        var counter = 0;
        rows.forEach((row) => {
          if (row.user_id) {
            result.push(Object.values(row)[0]);
            counter += 1;
            if (counter == rows.length) {
              resolve(result); 
              return;
            }
          }
        });
      });
    }) 
  }
  
  // @params colNames Array of column names to query for
  // returns Array of Objects
  getCols(dbName, colNames) {
    if (!dbName) {
      console.log("Please specify a database name");
      return;
    }
    return new Promise((resolve, reject) => {
      // Converting into SQL Command
      var SQL_QUERY_COMD = "SELECT " + colNames.join(", ") + " FROM " + dbName;
      console.log(SQL_QUERY_COMD);
      this.db.all(SQL_QUERY_COMD, (err, rows) => {
        if (err) {
          console.log(err);
          console.log("Error getting rows from " + dbName);
          resolve();
          return;
        } else if (rows == null || rows.length <= 0) {
            console.log("No matching entries found in " + dbName + " Database");
            resolve();
            return;
        }
        resolve(rows);
        return;
      })
    }) 
  }
  
  // Specific Method for Record-based (Telegram) Databases
  getAllUsers(dbName) {
    if (!dbName) {
      console.log("Please specify a database name");
      return;
    }
    return new Promise((resolve, reject) => {
      var result = [];
      this.db.all("SELECT DISTINCT user_id, first_name, username FROM " + dbName, (err, rows) => {
        if (err) {
          console.log(err);
          console.log("Error getting users from " + dbName);
          resolve(result);
          return;
        } else if (rows == null || rows.length <= 0) {
          console.log("No users found in " + dbName + " Database");
          resolve(result);
          return;
        }
        var counter = 0;
        rows.forEach((row) => {
          if (row.user_id) {
            result.push([row.first_name, row.user_id, '@' +  row.username]);
            counter += 1;
            if (counter == rows.length) {
              resolve(result); 
            }
          }
        })
        return;
      });
    })
  }
  
  getAllEntries(dbName) {
    return new Promise((resolve, reject) => {
      var result = [];
      var counter = 0;
      this.db.all("SELECT * FROM " + dbName, (err, rows) => {
        if (err) {
          console.log(err);
          console.log("Error Accessing " + dbName + " Database to GetAll")
          resolve(result);
          return;
        } else if (rows == null || rows.length <= 0) {
          console.log("Nothing found in " + dbName + " Database");
          resolve(result);
          return;
        }  
        rows.forEach((row) => {
          if (row) {
            result.push(row);
            counter += 1;
            if (counter == rows.length) {
              resolve(result); 
            }
          }
        })
      })
    });
  }
  
  async printAllEntries(dbName) {
    let dbRows = await this.getAllEntries(dbName);
    //console.log(users);
    console.log("Printing Entries...")
    dbRows.forEach((row) => {
      if (row) {
        console.log(row);
      }
    });
  }
}
  
module.exports = DatabaseInterface;