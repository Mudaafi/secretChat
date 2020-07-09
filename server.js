const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Custom Imports
const Config = require('./config.js');
const TelegramExtension = require('./telegram_extension.js');
const DatabaseInterface = require('./database_interface.js');
let dbInterface = new DatabaseInterface();
let tele = new TelegramExtension(dbInterface);

app.get("/", (request, response) => {
  dbInterface.printAllEntries("Users");
  response.end("ok");
});

app.post("/tele-update", (req, res) => {
  console.log("received");
  const message = req.body.message; // replace .message with .channel_post or .edited_message or .edited_channel_post where required
  if (!message) {
    return res.end('ok');
  }
  tele.processTeleMsg(message);
  return res.end('ok'); 
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});