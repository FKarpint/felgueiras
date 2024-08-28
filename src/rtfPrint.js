const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const htmlToRtf = require('html-to-rtf');
const pdf = require('html-pdf');

const novoArquivoRTF = path.resolve(__dirname, './senha.rtf');

async function printRTF(produtos, total, nPrint) {
  const imagePath = path.resolve(__dirname, './santa.jpg');
  const base64Image = convertImageToBase64(imagePath);

  if (fs.existsSync(novoArquivoRTF)) {
    fs.unlinkSync(novoArquivoRTF);
  }

  let produtosHtml = `
  <br>
  <pre>
  ${await formatString("QTD".toString(),3,"left")} | ${await formatString("PREÇO".toString(),5,"left")} | ${await formatString("DESCRIÇÃO".toString(),10,"left")}
  </pre>
  `;
  for (const produto of produtos) {
    let qtd = await formatString(produto.quantidade.toString(),4,"left");
    let preco = await formatString(produto.preco.toString(),6,"left");
    let descricao = await formatString(produto.descricao.toString(),18,"left");

    produtosHtml += `
    <br>
    <pre>
    <strong>${qtd}</strong> | ${preco} EUR | ${descricao}
    </pre>
    `;
  }

  const htmlTemplate = `
    <html>
      <body>
        <strong>Comissão de Festas Sta. Eufémia 2024</strong>
        <br>
        Felgueiras - Torre de Moncorvo
        <br>
        ________________________________
        <br>    
        ${produtosHtml}
        ________________________________
        <br>
        <p><strong>TOTAL: ${total.toFixed(2)} EUR</strong></p>
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

async function printPDF(produtos, total, nPrint) {
  const imagePath = path.resolve(__dirname, './santa.jpg');
  const base64Image = convertImageToBase64(imagePath);

  const novoArquivoPDF = path.resolve(__dirname, './senha.pdf');

  // Remove o arquivo PDF antigo se ele existir
  if (fs.existsSync(novoArquivoPDF)) {
    fs.unlinkSync(novoArquivoPDF);
  }

  let produtosHtml = '';
  for (const produto of produtos) {
    produtosHtml += `
      <tr>
        <td><strong>${produto.quantidade}</strong></td><td>${produto.descricao}</td><td>${produto.preco} €</td>
      </tr>`;
  }

  const htmlTemplate = `
  <html>
  <body>
  <table border="0" style="margin-bottom: 20px;">
  <tr>
    <td style="vertical-align: top; padding-right: 10px;">
      <img src="data:image/jpeg;base64,${base64Image}" alt="Imagem" style="max-width: 100px; height: auto;" />
    </td>
    <td style="vertical-align: top;">
      <strong>Comissão de Festas<br>Felgueiras 2024</strong>
    </td>
  </tr>
</table>
    <div>
      <table border="0">
        <tr>
          <td><strong>Qtd</strong></td>
          <td><strong>Descrição</strong></td>
          <td><strong>Preço</strong></td>
        </tr>
        ${produtosHtml}
      </table>
      <p><strong>TOTAL: ${total.toFixed(2)} €</strong></p>
    </div>
  </body>
</html>
  `;

  try {
    // Configuração para geração do PDF
    const options = { format: 'A4' };

    // Gera o PDF a partir do HTML
    pdf.create(htmlTemplate, options).toFile(novoArquivoPDF, function (err, res) {
      if (err) return console.error("Erro ao criar o arquivo PDF:", err);
      console.log("Arquivo PDF criado com sucesso.");

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
    });

  } catch (err) {
    console.error("Erro ao criar o arquivo PDF:", err);
  }
}

function convertImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

async function formatString(inputString, maxLength, alignment) {

  let formattedString = inputString.slice(0, maxLength);

  const spacesNeeded = maxLength - formattedString.length;

  if (alignment === 'left') {
    formattedString = formattedString + '&nbsp;'.repeat(spacesNeeded);
  } else if (alignment === 'right') {
    formattedString = '&nbsp;'.repeat(spacesNeeded) + formattedString;
  } else {
    throw new Error('Alinhamento deve ser "left" ou "right".');
  }

  return formattedString;
}

module.exports = { printRTF, printPDF };