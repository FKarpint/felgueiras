const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const util = require('util');

novoArquivoRTF = path.resolve(__dirname, './senha.rtf');

async function printRTF(produtos, total, nPrint) {
  if (fs.existsSync(novoArquivoRTF)) {
    fs.unlinkSync(novoArquivoRTF);
  } else {
    //console.log('O arquivo não existe, não é necessário excluí-lo.');
  }

  let produtosString = '';
  for (const produto of produtos) {
    produtosString += `\\pard\\sa200\\sl276\\slmult1\\b\\fs32 ${produto.quantidade} - ${produto.descricao} \\b0\\fs22\\par
    Preco Unidade: ${produto.preco}\\par
    ____________________________________\\par
    `;
  }

  const rtfTemplate = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2761
    \\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;\\f1\\fswiss\\fcharset0 Helvetica-Bold;}
    {\\colortbl;\\red255\\green255\\blue255;}
    {\\*\\expandedcolortbl;;}
    \\paperw11900\\paperh16840\\vieww12000\\viewh15840\\viewkind0
    \\pard\\tx560\\tx1120\\tx1680\\tx2240\\tx2800\\tx3360\\tx3920\\tx4480\\tx5040\\tx5600\\tx6160\\tx6720\\pardirnatural\\partightenfactor0
    
    \\f0\\fs24 \\cf0    							
    \\f1\\b\\fs36  
    \\fs22 Comiss\\'e3o de Festas de Felgueiras 2024\\b0\\par
  ____________________________________\\par
  ${produtosString}
  \\b\\fs32 TOTAL: ${total}\\b0\\fs22\\par
  \\f1\\par
  }`;
  try {
    fs.writeFileSync(novoArquivoRTF, rtfTemplate, 'utf8');
    //console.log("Arquivo escrito com sucesso");

    for (let i = 0; i < nPrint; i++) {
      //console.log("Iniciando impressão:", i);
      const pythonProcess = spawn(
        'python',
        [path.resolve(__dirname, './print.py')],
        { cwd: path.resolve(__dirname, './') }
      );

      /*
      pythonProcess.stdout.on('data', (data) => {
        const textChunk = data.toString('utf8');
        util.log(textChunk);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Processo Python finalizado com código ${code}`);
      });
      */
    }

  } catch (err) {
    console.error("Erro ao escrever arquivo:", err);
  }
}

module.exports = { printRTF };
