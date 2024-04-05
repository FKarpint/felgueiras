const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const moment = require("moment");

const { PosPrinter } = require("@alvarosacari/electron-pos-printer");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const debug = 0;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
    parent: parentWindow, // Define a janela principal como a janela pai
    modal: true,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false // Inicialmente não mostrada
  });

  modal.loadFile(path.join(__dirname, 'quantity.html'));

  modal.webContents.once('dom-ready', () => {
    modal.webContents.send('product-data', product);
  });

  modal.once('ready-to-show', () => {
    modal.show(); // Mostra a janela quando estiver pronta
  });

  return modal;
}

function printReceipt(product, quantity, total) {
  const receiptWindow = new BrowserWindow({
    //width: 300, // Largura de aproximadamente 80mm em pixels
    //height: 600, // Altura inicial; pode ajustar conforme necessário
    show: false, // Inicialmente não mostrada; será exibida conforme necessário
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  const imagePath = path.join(__dirname, 'santa.jpg');
  const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
  const imageSrc = `data:image/jpg;base64,${imageAsBase64}`;

  const receiptHtml = `<!DOCTYPE html>
  <html lang="pt">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recibo</title>
      <style>
      @page {
        margin-top: 0mm; /* Ajuste a margem superior conforme necessário */
        margin-left: 0mm;
        margin-right: 0mm;
        margin-bottom: 0mm;
      }
      body {
        height: 100%;
        width: 100%;
    }
          .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 30px; /* Tamanho da fonte para o cabeçalho */
              margin-bottom: 10px; /* Menos espaço abaixo do cabeçalho */
          }
          .header img {
              max-height: 100px; /* Reduzir o tamanho da imagem, se necessário */
          }
          .items {
              width: 100%;
              border-collapse: collapse;
          }
          .items th, .items td {
              text-align: left;
              padding: 4px; /* Reduzir o preenchimento nas células */
              border-bottom: 1px solid #ddd;
          }
          .total {
              font-size: 16px; /* Tamanho da fonte para o total */
              font-weight: bold;
              text-align: right;
          }
          .quantity {
              text-align: right;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <img src="${imageSrc}" alt="">
          <div>
              Comissão de Festas - Santa Eufêmia 2024<br>
              Felgueiras – Torre de Moncorvo
          </div>
      </div>
      <table class="items">
          <tr>
              <td colspan="2">${product.descricao}</td>
          </tr>
          <tr>
              <td class="quantity">Quantidade: ${quantity}</td>
              <td>Preço: ${product.preco}</td>
          </tr>
      </table>
      <div class="total">
          Total: ${total}
      </div>
  </body>
  </html>
  `;

  const data = moment().format("DD/MM/YYYY HH:mm:ss")
  fs.appendFileSync("registos.csv", `${product.descricao};${quantity};${product.preco};${total};${data}\n`);

  receiptWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(receiptHtml)}`);

  receiptWindow.webContents.on('did-finish-load', async () => {
    if (debug === 1) {
      receiptWindow.webContents.printToPDF({}).then(data => {
        const randomString = generateRandomString(6);
        const pdfName = `recibo_${randomString}.pdf`;
        const pdfPath = path.join(__dirname, pdfName);
        fs.writeFile(pdfPath, data, (err) => {
          if (err) throw err;
          console.log('PDF salvo em:', pdfPath);
        });
        receiptWindow.close();
      }).catch(err => {
        console.log(err);
        receiptWindow.close();
      });
    } else if (debug === 2) {
      // Apenas mostra a janela do recibo na tela
      receiptWindow.show();
    } else {

      await printSenha(product, quantity, total);

      /*
      const options = {
        preview: false,
        width: '80mm',
        margin: '0 0 0 0',
        copies: 1,
        printerName: '',
        //timeOutPerLine: 800,
        //pageSize: { height: 301000, width: 71000 },
        silent: true
      };

      console.log('Imprimindo recibo...');

      receiptWindow.webContents.print(options, (success, failureReason) => {
        if (!success) {
          console.log('Falha na impressão:', failureReason);
        } else {
          console.log('Recibo impresso com sucesso.');
        }
        receiptWindow.close(); // Feche a janela aqui, dentro da callback
        console.log('Fim recibo...');
      });
      */
    }
  });
}

async function printSenha(product, quantity, total) {
  const options = {
    preview: false,               // Preview in window or print
    //width: '170px',               //  width of content body
    margin: '0 0 0 0',            // margin of content body
    copies: 1,                    // Number of copies to print
    printerName: 'POS-80',        // printerName: string, check with webContent.getPrinters()
    timeOutPerLine: 400,
    pageSize: { height: 301000, width: 71000 },  // page size
    silent: true
 }
 
 const data = [
    {
      type: 'image',
      path: path.join(__dirname, 'santa.jpg'),     // file path
      position: 'center',                                  // position of image: 'left' | 'center' | 'right'
      width: '60px',                                           // width of image in px; default: auto
      height: '60px',                                          // width of image in px; default: 50 or '50px'
    },{
       type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
       value: 'SAMPLE HEADING',
       style: `text-align:center;`,
       css: {"font-weight": "700", "font-size": "18px"}
    },{
       type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
       value: 'Secondary text',
       style: `text-align:left;color: red;`,
       css: {"text-decoration": "underline", "font-size": "10px"}
    },{
       type: 'barCode',
       value: 'HB4587896',
       height: 12,                     // height of barcode, applicable only to bar and QR codes
       width: 1,                       // width of barcode, applicable only to bar and QR codes
       displayValue: true,             // Display value below barcode
       fontsize: 8,
    },{
      type: 'qrCode',
       value: 'https://github.com/alvarosacari/electron-pos-printer',
       height: 55,
       width: 55,
       style: 'margin: 10 20px 20 20px'
     },{
        type: 'table',
        // style the table
        style: 'border: 1px solid #ddd',
        // list of the columns to be rendered in the table header
        tableHeader: ['Animal', 'Age'],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: [
            ['Cat', 2],
            ['Dog', 4],
            ['Horse', 12],
            ['Pig', 4],
        ],
        // list of columns to be rendered in the table footer
        tableFooter: ['Animal', 'Age'],
        // custom style for the table header
        tableHeaderStyle: 'background-color: #000; color: white;',
        // custom style for the table body
        tableBodyStyle: 'border: 0.5px solid #ddd',
        // custom style for the table footer
        tableFooterStyle: 'background-color: #000; color: white;',
     },{
        type: 'table',
        style: 'border: 1px solid #ddd',             // style the table
        // list of the columns to be rendered in the table header
        tableHeader: [{type: 'text', value: 'Animal'}, {type: 'image', path: path.join(__dirname, 'icons/animal.png')}],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: [
            [{type: 'text', value: 'Cat'}, {type: 'image', path: './animals/cat.jpg'}],
            [{type: 'text', value: 'Dog'}, {type: 'image', path: './animals/dog.jpg'}],
            [{type: 'text', value: 'Horse'}, {type: 'image', path: './animals/horse.jpg'}],
            [{type: 'text', value: 'Pig'}, {type: 'image', path: './animals/pig.jpg'}],
        ],
        // list of columns to be rendered in the table footer
        tableFooter: [{type: 'text', value: 'Animal'}, 'Image'],
        // custom style for the table header
        tableHeaderStyle: 'background-color: #000; color: white;',
        // custom style for the table body
        tableBodyStyle: 'border: 0.5px solid #ddd',
        // custom style for the table footer
        tableFooterStyle: 'background-color: #000; color: white;',
     },
 ]
 
 PosPrinter.print(data, options)
  .then(() => {})
  .catch((error) => {
     console.error(error);
   });
}

ipcMain.on('print-receipt', async (event, product, quantity, total) => {
  //printReceipt(product, quantity, total);
  await printSenha(product, quantity, total);
});

ipcMain.on('open-quantity-window', (event, product) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  createQuantityWindow(parentWindow, product);
});

ipcMain.on('close-quantity-window', (event) => {
  const webContents = event.sender;
  const window = BrowserWindow.fromWebContents(webContents);
  if (window) window.close();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
