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
        let tbody = orderItems.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            orderItems.appendChild(tbody);
        }

        const tableRow = document.createElement('tr');

        const descCell = document.createElement('td');
        descCell.textContent = product.descricao;
        tableRow.appendChild(descCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = `${quantity}`;
        tableRow.appendChild(quantityCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `${product.preco}`;
        tableRow.appendChild(priceCell);

        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Apagar';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', function (event) {
            // Remover a linha da tabela
            tableRow.remove();
            // Atualizar o total
            updateTotal();
        });
        deleteCell.appendChild(deleteButton);
        tableRow.appendChild(deleteCell);

        tableRow.setAttribute('data-preco', product.preco);
        tableRow.setAttribute('data-quantidade', quantity);
        tbody.appendChild(tableRow);
        updateTotal();
    }
});

ipcRenderer.on('receipt-printed', (event,) => {
    const orderItems = document.getElementById('order-items');
    const rows = orderItems.querySelectorAll('tbody tr');

    // Remove todas as linhas do 'tbody'
    for (let i = 0; i < rows.length; i++) {
        rows[i].remove();
    }
    updateTotal();
});

function updateDateTime() {
    const footerBar = document.getElementById('footer-bar');
    const now = new Date();
    const formattedDateTime = now.toLocaleString('pt-PT', { hour12: false });
    footerBar.textContent = formattedDateTime;
}

function updateTotal() {
    const orderItems = document.querySelectorAll('#order-items tr');
    let total = 0;
    orderItems.forEach(item => {
        const precoAttr = item.getAttribute('data-preco');
        const quantidadeAttr = item.getAttribute('data-quantidade');
        if (precoAttr && quantidadeAttr) {
            const preco = parseFloat(precoAttr.replace(',', '.'));
            const quantidade = parseInt(quantidadeAttr);
            total += preco * quantidade;
        }
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
    const orderItems = document.querySelectorAll('#order-items tr');
    let products = Array.from(orderItems).map(item => ({
        descricao: item.children[0].textContent,
        quantidade: parseInt(item.getAttribute('data-quantidade')),
        preco: item.getAttribute('data-preco')
    }));
    products.shift();
    const totalText = document.getElementById('total').textContent;
    const total = parseFloat(totalText.split('€')[1].replace(',', '.'));

    ipcRenderer.send('print-receipt', products, total, 1);
});
