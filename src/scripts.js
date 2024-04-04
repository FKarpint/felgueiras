const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

function loadProducts() {
    fetch('../data/produtos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            const productContainer = document.getElementById('product-buttons');
            products.forEach(product => {
                const btn = document.createElement('button');
                //btn.style.height = '100px';
                //btn.style.width = '100px';
                btn.textContent = product.descricao + ' -  ' + product.preco;
                btn.onclick = () => openQuantityScreen(product);
                productContainer.appendChild(btn);
            });
        })
        .catch(error => {
            console.error('Error loading the products:', error);
        });
}

function openQuantityScreen(product) {
    console.log('Opening quantity screen for:', product);
    ipcRenderer.send('open-quantity-window', product);
}