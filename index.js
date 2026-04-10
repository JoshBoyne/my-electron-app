const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function getStorePath(name){
  return path.join(app.getPath('userData'), `${name}.json`);
}

function readStore(name){
  try{
    return JSON.parse(fs.readFileSync(getStorePath(name), 'utf8'));
  } catch{
    return [];
  }
}

function writeStore(name, data){
  fs.writeFileSync(getStorePath(name), JSON.stringify(data, null, 2), 'utf8');
}

ipcMain.handle('notes:getAll', () => readStore('notes'));
ipcMain.handle('notes:save',   (_, notes) => writeStore('notes', notes));

ipcMain.handle('mood:getAll', () => readStore('mood'));
ipcMain.handle('mood:save',   (_, entry) => {
  const log = readStore('mood');
  const idx = log.findIndex(e => e.date === entry.date);
  if (idx !== -1) {
    log[idx] = entry;
  } else {
    log.push(entry);
  }
  writeStore('mood', log);
});

function createWindow(){
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false, 
    },
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});