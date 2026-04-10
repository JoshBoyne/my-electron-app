const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  notes: {
    getAll: ()      => ipcRenderer.invoke('notes:getAll'),
    save:   (notes) => ipcRenderer.invoke('notes:save', notes),
  },
  mood: {
    getAll: ()      => ipcRenderer.invoke('mood:getAll'),
    save:   (entry) => ipcRenderer.invoke('mood:save', entry),
  },
});