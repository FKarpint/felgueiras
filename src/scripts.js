const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function () {
    loadMenu();
});

function loadMenu() {
    fetch('../data/produtos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const productContainer = document.getElementById('product-buttons');
            productContainer.innerHTML = '';

            for (const categoria in data) {
                const btn = document.createElement('button');
                btn.textContent = categoria;
                btn.onclick = () => loadProducts(data[categoria], data);
                productContainer.appendChild(btn);
            }
        })
        .catch(error => {
            console.error('Error loading the menu:', error);
        });
}

function loadProducts(products, allData) {
    const productContainer = document.getElementById('product-buttons');
    productContainer.innerHTML = '';

    products.forEach(product => {
        const btn = document.createElement('button');
        btn.textContent = product.descricao + ' - ' + product.preco;
        btn.onclick = () => openQuantityScreen(product);
        productContainer.appendChild(btn);
    });

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Voltar ao Menu';
    backBtn.style.backgroundColor = 'red';
    backBtn.style.color = 'white';
    backBtn.onclick = () => loadMenu(allData);
    productContainer.appendChild(backBtn);
}

function openQuantityScreen(product) {
    console.log('Opening quantity screen for:', product);
    ipcRenderer.send('open-quantity-window', product);
}