const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron/main')
const path = require('node:path')

/*function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}
*/

let progressInterval

function createWindow(){
    const win = new BrowserWindow()
    
    win.loadFile('index.html')

    const INCREMENT = 0.03
    const INTERVAL_DELAY = 100

    let c = 0
    progressInterval = setInterval(() => {
        win.setProgressBar(c)

        if(c < 2){
            c += INCREMENT
        }else {
            c = (-INCREMENT * 5)
        }
    }, INTERVAL_DELAY)
}

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})

app.whenReady().then(createWindow)

// before the app is terminated, clear both timers
app.on('before-quit', () => {
  clearInterval(progressInterval)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})