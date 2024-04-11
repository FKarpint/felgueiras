const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function () {
    loadMenu();
    updateDateTime();
    setInterval(updateDateTime, 1000);
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
    ipcRenderer.send('open-quantity-window', product);
}

ipcRenderer.on('quantity-selected', (event, quantity, product) => {
    if (product && quantity) {
        const orderItems = document.getElementById('order-items');
        const listItem = document.createElement('li');
        listItem.textContent = `${product.descricao} - Qtd: ${quantity} - Preço: €${product.preco}`;
        listItem.setAttribute('data-preco', product.preco);
        listItem.setAttribute('data-quantidade', quantity);
        orderItems.appendChild(listItem);
        updateTotal();
    }
});


function updateDateTime() {
    const footerBar = document.getElementById('footer-bar');
    const now = new Date();
    const formattedDateTime = now.toLocaleString('pt-PT', { hour12: false });
    footerBar.textContent = formattedDateTime;
}

function updateTotal() {
    const orderItems = document.querySelectorAll('#order-items li');
    let total = 0;
    orderItems.forEach(item => {
        const preco = parseFloat(item.getAttribute('data-preco').replace(',', '.'));
        const quantidade = parseInt(item.getAttribute('data-quantidade'));
        total += preco * quantidade;
    });
    document.getElementById('total').textContent = `Total: €${total.toFixed(2).replace('.', ',')}`;
    const printButton = document.getElementById('print-button');
    if (total > 0) {
        printButton.disabled = false;
    } else {
        printButton.disabled = true;
    }
}

document.getElementById('print-button').addEventListener('click', () => {
    const orderItems = document.querySelectorAll('#order-items li');
    const products = Array.from(orderItems).map(item => ({
      descricao: item.textContent.split(' - Qtd: ')[0],
      quantidade: parseInt(item.getAttribute('data-quantidade')),
      preco: item.getAttribute('data-preco')
    }));
    const totalText = document.getElementById('total').textContent;
    const total = parseFloat(totalText.split('€')[1].replace(',', '.'));
  
    ipcRenderer.send('print-receipt', products, total, 1);
  });
  