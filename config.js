class Config {
  static getBotKey() {
    return process.env.TELE_BOT_KEY;
  }
  static getPort() {
    return process.env.PORT;
  }
}

module.exports = Config;
