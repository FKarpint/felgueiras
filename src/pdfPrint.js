//Required package
var fs = require("fs");
const path = require('node:path');

const filePath = "./src/senha.rtf";
// Read file Template
//var file = fs.readFileSync(filePath, "utf8");

const parseRTF = require('rtf-parser');

const imagePath = path.join(__dirname, 'santa.jpg');
const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
const imageSrc = `data:image/jpg;base64,${imageAsBase64}`;


async function deleteFile(filePath) {
  try {
    fs.unlink(filePath);
    console.log(`File ${filePath} has been deleted.`);
  } catch (err) {
    console.error(err);
  }
}


async function printSenha(product, quantity, total) {
  await deleteFile(filePath);

  const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang2070{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}
{\\*\\generator Riched20 10.0.22621}\\viewkind4\\uc1 
\\pard\\sa200\\sl276\\slmult1\\f0\\fs22\\lang22 Teste de Impress\\'e3o\\par
FIM\\par
}`;

  fs.writeFile(filePath, rtfContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Arquivo RTF salvo com sucesso!');
  });

  const printOptions = {
    printer: "POS-80",
  };

  await print(filePath, printOptions).then(console.log);



}

module.exports = printSenha;