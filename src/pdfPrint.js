//Required package
var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require('node:path');

// Read HTML Template
var html = fs.readFileSync("senha.html", "utf8");

const imagePath = path.join(__dirname, 'santa.jpg');
const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
const imageSrc = `data:image/jpg;base64,${imageAsBase64}`;

var options = {
  border: "0mm",
  header: {
    height: "10mm",
    contents: `<div style="text-align: center;">Comissão de Festas 2024<br>Felgueiras - Torre de Moncorvo</div>`
  }
};

var users = [
  {
    nome: "Fino",
    qtd: 1,
    preco: 5
  }
];
var total = users.qtd * users.preco;

var document = {
  html: html,
  data: {
    users: users,
    total,
    imageSrc
  },
  path: "./recibo.pdf",
  type: "",
};

pdf
  .create(document, options)
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.error(error);
  });