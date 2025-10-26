// The Image Compare web application does not require any Node.js APIs. This file
// intentionally exposes nothing to the renderer process while keeping
// Electron's security defaults intact.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('imageCompareDesktop', {});
