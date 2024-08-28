const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const htmlToRtf = require('html-to-rtf');

const novoArquivoRTF = path.resolve(__dirname, './senha.rtf');

async function printRTF(produtos, total, nPrint) {
  const imagePath = path.resolve(__dirname, './santa.jpg');
  const base64Image = convertImageToBase64(imagePath);

  if (fs.existsSync(novoArquivoRTF)) {
    fs.unlinkSync(novoArquivoRTF);
  }

  let produtosHtml = '';
  for (const produto of produtos) {
    produtosHtml += `
      <tr>
      <td><strong>${produto.quantidade}</strong></td><td>${produto.descricao}</strong></td><td>${produto.preco}</td>
      <tr>`;
  }

  const htmlTemplate = `
    <html>
      <body>
        <h1>Comissão de Festas de Felgueiras 2024</h1>
        <img src="data:image/jpeg;base64,${base64Image}" alt="Imagem" />
        <table border="0">
        <tr>
        <td>Qtd</td><td>Descrição</td><td>Preço Un</td>
        </tr>
        ${produtosHtml}
        </table>
        <p><strong>TOTAL: ${total.toFixed(2)}</strong></p>
      </body>
    </html>
  `;

  // Converte o HTML para RTF
  const rtf = htmlToRtf.convertHtmlToRtf(htmlTemplate);

  try {
    fs.writeFileSync(novoArquivoRTF, rtf, 'utf8');
    console.log("Arquivo RTF criado com sucesso.");

    for (let i = 0; i < nPrint; i++) {
      const pythonProcess = spawn('python', [path.resolve(__dirname, './print.py')], { cwd: path.resolve(__dirname, './') });

      // Opções de debug de saída
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
    console.error("Erro ao escrever o arquivo RTF:", err);
  }
}

function convertImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

module.exports = { printRTF };