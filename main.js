// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { runFontMin } = require("./fontmin.js");

ipcMain.on("doFontMin", async (event, arg) => {
  // arg为接受到的消息
  const res = await runFontMin(arg);
  console.log(res, "fontmin async done");
  event.sender.send("fontMinDone", res);
});

ipcMain.on("getAppPath", async (event, arg) => {
  event.sender.send("getAppPathDone", app.getPath("downloads"));
});

const isDev = !app.isPackaged;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    titleBarStyle: "hiddenInset",
    width: 900,
    height: 600,
    icon: "icon.png",
    webPreferences: {
      // preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: false,
  });

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL("http://localhost:8000");
    // mainWindow.loadFile(path.join(__dirname, "/appView/public/index.html"));
  } else {
    mainWindow.loadFile(path.join(__dirname, "/appView/public/index.html"));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (isDev) {
    setTimeout(() => {
      createWindow();
    }, 2000); // waiting for localhost view to load
  } else {
    createWindow();
  }

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  // if (process.platform !== "darwin") app.quit();
  app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
