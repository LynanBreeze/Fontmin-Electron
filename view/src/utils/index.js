const path = require("path");

function getAppDataPath() {
  switch (process.platform) {
    case "darwin": {
      return path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "fontmin"
      );
    }
    case "win32": {
      return path.join(process.env.APPDATA, "fontmin");
    }
    case "linux": {
      return path.join(process.env.HOME, ".fontmin");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
}

module.exports = {
  getAppDataPath,
};
