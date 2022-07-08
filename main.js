const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require("fs")

const data_path = __dirname + "/data.json"

function createWindow () {
  const win = new BrowserWindow({
    width: 1600,
    height: 980,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => win.webContents.send("menu-toogle-sidebar"),
          label: "Neuer Eintrag",
        },
        {
          click: () => win.webContents.print(
            {
              silent: true,
              landscape: true,
              color: true,
              printBackground: true,
              margin: {
                marginType: "printableArea"
              }
            }
          ),
          label: "Seite drucken (experimentell)",
        },
        {
          click: () => open_week_calendar(win),
          label: "Wochenansicht",
        },
        {
          click: () => open_month_calendar(win),
          label: "Monatsansicht",
        }
      ]
    }
  ])

  ipcMain.handle("handle-confirm", (event) => {
    const options = {
      type: "question",
      buttons: ["Ja", "Nein"],
      title: "Frage",
      message: "Möchtest du den Eintrag wirklich löschen?"
    }

    let button = dialog.showMessageBoxSync(win, options)
    if(button === 0) {
      return true
    } 
    else if(button === 1) {
      return false
    }
  })

  ipcMain.on("view-to-week", (event) => {
    open_week_calendar(win)
  })

  ipcMain.on("view-to-month", (event) => {
    open_month_calendar(win)
  })

  Menu.setApplicationMenu(menu)
  open_week_calendar(win)
  //win.openDevTools()
}

function open_week_calendar(win) {
  win.loadFile(__dirname + '/week.html')
}

function open_month_calendar(win) {
  win.loadFile(__dirname + "/month.html")
}

function check_data_path() {
  fs.access(data_path, fs.F_OK, (err) => {
    if(err) {
      fs.writeFileSync(data_path, "[]")
    }
  })
}

ipcMain.on("handle-add-entry", (event, entry) => {
  check_data_path()
  let data_str = fs.readFileSync(data_path)
  let data = JSON.parse(data_str)
  data.push(entry)
  fs.writeFileSync(data_path, JSON.stringify(data, null, 4))
})

ipcMain.on("handle-remove-entry", (event, entry) => {
  check_data_path()
  let data_str = fs.readFileSync(data_path)
  let data = JSON.parse(data_str)

  for(let i = 0; i < data.length; i++) {
    if(data[i].date == entry.date && data[i].time_start == entry.time_start && data[i].time_end == entry.time_end && data[i].message == entry.message && data[i].color == entry.color) {
      data.splice(i, 1)
      break;
    }
  }

  fs.writeFileSync(data_path, JSON.stringify(data, null, 4))
})

function get_entry_from_date(event, date) {
  let year = date.getFullYear().toString()
  let month = (date.getMonth() + 1).toString().padStart(2, "0")
  let day = date.getDate().toString().padStart(2, "0")
  let date_str = `${year}-${month}-${day}`
  
  check_data_path()
  let entry_array = []
  let json_str = fs.readFileSync(data_path)
  let json = JSON.parse(json_str)
  
  for(let i = 0; i < json.length; i++) {
    let entry_date = new Date(json[i]["date"])
    if(json[i]["schedule"] === "unique") {
      if(json[i]["date"] === date_str) {
        entry_array.push(json[i])
      }
    }
    if(json[i]["schedule"] === "weekly") {
      if(entry_date.getDay() === date.getDay() && entry_date < date) {
        entry_array.push(json[i])
      }
    }
    if(json[i]["schedule"] === "monthly") {
      if(entry_date.getDate() === date.getDate() && entry_date < date) {
        entry_array.push(json[i])
      }
    }
    if(json[i]["schedule"] === "yearly") {
      if(entry_date.getMonth() === date.getMonth() && entry_date.getDate() === date.getDate() && entry_date < date) {
        entry_array.push(json[i])
      }
    }
  }
  return entry_array
}

app.whenReady().then(() => {
  createWindow()
  ipcMain.handle("get-entry", get_entry_from_date)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
