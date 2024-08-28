const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const moment = require("moment");
const { printRTF, printPDF } = require('./rtfPrint');


if (require('electron-squirrel-startup')) {
  app.quit();
}

const debug = 1;

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

function createQuantityWindow(parentWindow, product) {
  let modal = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });

  modal.loadFile(path.join(__dirname, 'quantity.html'));

  modal.webContents.once('dom-ready', () => {
    modal.webContents.send('product-data', product);
  });

  modal.once('ready-to-show', () => {
    modal.show();
  });

  return modal;
}

ipcMain.on('print-receipt', async (event, products, total, nPrint) => {
  printReceipt(products, total, nPrint);
});

ipcMain.on('open-quantity-window', (event, product) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  createQuantityWindow(parentWindow, product);
});

ipcMain.on('quantity-chosen', (event, quantity, product) => {
  mainWindow.webContents.send('quantity-selected', quantity, product);
});

ipcMain.on('close-quantity-window', (event) => {
  const webContents = event.sender;
  const window = BrowserWindow.fromWebContents(webContents);
  if (window) window.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//new Changes FC
ipcMain.on('open-print-qtd-window', (parentWindow, data) => {
  printData = data;

  let printQtdWindow = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });
  printQtdWindow.loadFile(path.join(__dirname, 'print-qtd.html'));

  printQtdWindow.once('ready-to-show', () => {
    printQtdWindow.show();
  });

  printQtdWindow.on('closed', () => {
    printQtdWindow = null;
  });
});

ipcMain.on('print-chosen', (event, nPrint) => {

  printReceipt(printData.products, printData.total, nPrint);
});

async function printReceipt(products, total, nPrint) {
  await printRTF(products, total, nPrint);
  //await printPDF(products, total, nPrint);
  const data = moment().format("DD/MM/YYYY HH:mm:ss")
  fs.appendFileSync("registos.csv", products.map(p => `${p.descricao};${p.quantidade};${nPrint};${p.preco};${total};${data}\n`).join(''));
  mainWindow.webContents.send('receipt-printed');
}