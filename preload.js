const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  handle_menu_sidebar: (callback) => ipcRenderer.on("menu-toogle-sidebar", callback),
  handle_add_entry: (entry) => ipcRenderer.send("handle-add-entry", entry),
  get_entry_from_date: (date) => ipcRenderer.invoke("get-entry", date),
  handle_remove_entry: (entry) => ipcRenderer.send("handle-remove-entry", entry),
  handle_confirm: (callback) => ipcRenderer.invoke("handle-confirm", callback),
  view_to_week: (callback) => ipcRenderer.send("view-to-week", callback),
  view_to_month: (callback) => ipcRenderer.send("view-to-month", callback),
})