class Config {
  static getBotKey() {
    return process.env.TELE_BOT_KEY;
  }
}

module.exports = Config;