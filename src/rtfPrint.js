const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const util = require('util');

const pythonProcess = spawn(
  'python',
  [path.resolve(__dirname, './print.py')],
  {
    cwd: path.resolve(__dirname, './')
  },
);

async function printRTF(produto, quantidade, preco, total) {

  const rtfTemplate = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang2070{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}
{\\*\\generator Riched20 10.0.22621}\\viewkind4\\uc1 
\\pard\\sa200\\sl276\\slmult1\\qc\\f0\\fs22\\lang22 Comiss\\'e3o de Festas 2024\\par
Felgueiras - Torre de Moncorvo\\par
_____________________________________\\par

\\pard\\sa200\\sl276\\slmult1 ${produto}\\par
Quantidade: ${quantidade}\\par
Preco: ${preco}\\par
_____________________________________\\par
TOTAL: ${total}\\par
\\par
}
`;

  fs.writeFile(novoArquivoRTF, rtfTemplate, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    pythonProcess.stdout.on('data', (data) => {
      const textChunk = data.toString('utf8');

      util.log(textChunk);
    });
  });
}

module.exports = { printRTF };
