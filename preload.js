const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("runehaven", {
  changeView: (view) => ipcRenderer.send("change", view),
  getSpells: () => ipcRenderer.invoke("runehaven:getSpells"),
  sendSpell: (name, cords, lines, description) =>
    ipcRenderer.send("send-spell", { name, cords, lines, description }),
  deleteSpell: (name) => ipcRenderer.send("remove-spell", { name }),
});
