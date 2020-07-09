const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const https = require("https");
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

app.post("/secret_chat", (req, res) => {
  console.log("received");
  const message = req.body.message; // replace .message with .channel_post or .edited_message or .edited_channel_post where required
  if (!message) {
    return res.end();
  }
  tele.processTeleMsg(message);
  return res.end(); 
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};


const httpsServer = https.createServer({
  key: fs.readFileSync('./.data/YOURPRIVATE.key'),
  cert: fs.readFileSync('./.data/YOURPUBLIC.pem'),
}, app);

var listener = httpsServer.listen(Config.getPort(), () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
})

/**
// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
*/
