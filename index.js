if (require("electron-squirrel-startup")) return;

const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const spellFolder = path.join(
  process.env["localappdata"],
  "Runehaven-Spellbook"
);
const spellPath = path.join(spellFolder, "spells.json");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 300,
    height: 500,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  ipcMain.on("send-spell", async (event, args) => {
    const { name, cords, lines, description } = args;

    /** @type {{ cords: number[]; name: string; lines: string[]; description: string }[]} */
    const spells = JSON.parse(fs.readFileSync(spellPath).toString());
    spells.push({ name, cords, lines, description });
    fs.writeFileSync(spellPath, JSON.stringify(spells));
  });

  ipcMain.on("remove-spell", (event, args) => {
    const { name } = args;

    /** @type {{ cords: number[]; name: string; lines: string[]; description: string }[]} */
    const spells = JSON.parse(fs.readFileSync(spellPath).toString());
    const index = spells.findIndex((v) => v.name == name);
    if (index !== -1) spells.splice(index, 1);

    fs.writeFileSync(spellPath, JSON.stringify(spells));
  });

  ipcMain.on("change", (_, view) => {
    let center = true;
    switch (view) {
      case "index":
        win.setSize(300, 500);
        break;
      case "search":
        center = false;
        break;
      case "getSpells":
        let history = win.webContents.navigationHistory.getAllEntries();
        if (history[history.length - 1].title == "Search Spells")
          center = false;
      default:
        win.setSize(800, 530);
        break;
    }
    win.loadFile(`views/${view}.html`);
    if (center) win.center();
  });

  win.loadFile("views/index.html");
  win.center();
  return win;
};

app.whenReady().then(() => {
  console.log(spellPath);

  if (!fs.existsSync(spellPath)) {
    fs.mkdirSync(spellFolder, { recursive: true });
    fs.writeFileSync(spellPath, JSON.stringify([]));
  }

  ipcMain.handle("runehaven:getSpells", () => {
    return JSON.parse(fs.readFileSync(spellPath).toString());
  });

  createWindow();
});
