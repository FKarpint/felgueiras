//Required package
var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require('node:path');
const { print } = require("pdf-to-printer");

// Read HTML Template
var html = fs.readFileSync("./src/senha.html", "utf8");

const imagePath = path.join(__dirname, 'santa.jpg');
const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
const imageSrc = `data:image/jpg;base64,${imageAsBase64}`;

var options = {
  border: "0mm",
};

async function printSenha(product, quantity, total) {

  var document = {
    html: html,
    data: {
      product,
      quantity,
      total,
      imageSrc
    },
    path: "./recibo.pdf",
    type: "",
  };

  await pdf.create(document, options).then(async (res) => {
      console.log(res);
      const printOptions = {
        printer: "POS-80",
      };
      await print(res.filename, printOptions).then(console.log);
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = printSenha;