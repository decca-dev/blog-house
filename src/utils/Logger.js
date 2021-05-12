const chalk = require("chalk");

module.exports = class Log {
  static getSource(src) {
    return src ? src.toUpperCase() : "OTHER";
  }

  static info(message, src) {
    console.log(
      `[${this.toHHMMSS(new Date())}] ${chalk.green("INFO")} [${this.getSource(
        src
      )}] ${message}`
    );
  }

  static error(err, src) {
    const message = err || "Unknown error";
    console.error(
      `[${this.toHHMMSS(new Date())}] ${chalk.red("ERROR")} [${this.getSource(
        src
      )}] ${message}`
    );
  }

  static toHHMMSS(time) {
    let hours = time.getHours().toString().padStart(2, "0");
    let minutes = time.getMinutes().toString().padStart(2, "0");
    let seconds = time.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
};
