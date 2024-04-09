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

// Substitua pelos valores reais
const produto = "Nome do Produto";
const quantidade = "10";
const total = "100,00";

// Conteúdo RTF com os marcadores a serem substituídos
const rtfTemplate = `{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang2070{\fonttbl{\f0\fnil\fcharset0 Calibri;}}
{\*\generator Riched20 10.0.22621}\viewkind4\\uc1
\pard\sa200\sl276\slmult1\qc\f0\fs22\lang22 Comiss\'e3o de Festas 2024\par
Felgueiras - Torre de Moncorvo\par
_____________________________________\par

\pard\sa200\sl276\slmult1 $\{produto\}\par
Quantidade: $\{quantidade\}\par
_____________________________________\par
TOTAL: $\{total\}\par
\par
}
`;

const rtfFinal = rtfTemplate
  .replace("${produto}", produto)
  .replace("${quantidade}", quantidade)
  .replace("${total}", total);

// Caminho e nome do arquivo para salvar
const novoArquivoRTF = 'senha.rtf';

// Escrever o conteúdo no novo arquivo
fs.writeFile(novoArquivoRTF, rtfFinal, 'utf8', (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Novo arquivo RTF salvo com sucesso!');
  pythonProcess.stdout.on('data', (data) => {
    const textChunk = data.toString('utf8'); // buffer to string

    util.log(textChunk);
  });
});