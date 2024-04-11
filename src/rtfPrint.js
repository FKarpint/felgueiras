const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const util = require('util');

novoArquivoRTF = path.resolve(__dirname, './senha.rtf');

async function printRTF(produto, quantidade, preco, total, nPrint) {
  try {
    fs.statSync(novoArquivoRTF);
    fs.unlinkSync(novoArquivoRTF);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('O arquivo não existe, não é necessário excluí-lo.');
    } else {
      //throw error;
    }
  }

  const rtfTemplate = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang2070{\\fonttbl{\\f0\\fnil\\fcharset0 Curlz MT;}{\\f1\\fnil\\fcharset0 Calibri;}}
  {\\*\\generator Riched20 10.0.22621}\\viewkind4\\uc1 
  \\pard\\sa200\\sl276\\slmult1\\qc\\b\\f0\\fs36\\lang22 Taberna Medieval\\par
  \\fs22 Comiss\\'e3o de Festas de Felgueiras 2024\\b0\\par
  ____________________________________\\par
  
  \\pard\\sa200\\sl276\\slmult1\\b\\fs32 ${quantidade} - ${produto} \\b0\\fs22\\par
  Preco Unidade: ${preco}\\par
  ____________________________________\\par
  \\b\\fs32 TOTAL: ${total}\\b0\\fs22\\par
  \\f1\\par
  }  
`;

  fs.writeFileSync(novoArquivoRTF, rtfTemplate, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("PRINT:", nPrint);
    for (let i = 0; i < nPrint; i++) {
      console.log("PRINT:", i);
      const pythonProcess = spawn(
        'python',
        [path.resolve(__dirname, './print.py')],
        {
          cwd: path.resolve(__dirname, './')
        },
      );
      pythonProcess.stdout.on('data', (data) => {
        const textChunk = data.toString('utf8');

        util.log(textChunk);
      });
    }
  });
}

module.exports = { printRTF };
