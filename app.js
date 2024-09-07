document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.querySelector("#cart-icon");
    const cart = document.querySelector(".cart");
    const closeCart = document.querySelector("#cerrar");

    cartIcon.addEventListener('click', () => {
        cart.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cart.classList.remove('active');
    });

    let cartItems = JSON.parse(localStorage.getItem('cart')) || {};

    function updateCart() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        if (cartContainer && cartTotal) {
            cartContainer.innerHTML = '';
            let total = 0;

            for (const productoId in cartItems) {
                if (cartItems.hasOwnProperty(productoId)) {
                    const item = cartItems[productoId];
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        ${item.name} - Cantidad: 
                        <input type="number" class="cantidad-input" data-producto-id="${productoId}" value="${item.cantidad}" min="1">
                        - Precio: $${item.precio * item.cantidad}
                        <button class="remove-from-cart" data-producto-id="${productoId}">Eliminar</button>
                    `;
                    cartContainer.appendChild(listItem);
                    total += item.precio * item.cantidad;
                }
            }

            cartTotal.textContent = `Total: $${total}`;
            localStorage.setItem('cart', JSON.stringify(cartItems));

            document.querySelectorAll('.cantidad-input').forEach(input => {
                input.addEventListener('input', (event) => {
                    const productoId = event.target.getAttribute('data-producto-id');
                    const nuevaCantidad = parseInt(event.target.value);
                    if (nuevaCantidad > 0) {
                        cartItems[productoId].cantidad = nuevaCantidad;
                        updateCart();
                    }
                });
            });

            document.querySelectorAll('.remove-from-cart').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productoId = event.target.getAttribute('data-producto-id');
                    delete cartItems[productoId];
                    updateCart();
                });
            });
        }
    }

    function fetchProducts() {
        fetch('productos.json')
            .then(response => response.json())
            .then(data => displayProducts(data))
            .catch(error => console.error('Error cargando el JSON:', error));
    }

    function displayProducts(products) {
        // Determinar el contenedor y el rango de IDs basado en el archivo HTML actual
        const contenedor = document.getElementById('product-container-section1') || 
                            document.getElementById('product-container-section2') || 
                            document.getElementById('product-container-section3') || 
                            document.getElementById('product-container-section4') || 
                            document.getElementById('product-container-section5') || 
                            document.getElementById('product-container-section6');

        let rangoIds;
        switch (contenedor.id) {
            case 'product-container-section1':
                rangoIds = { min: 1, max: 17 };
                break;
            case 'product-container-section2':
                rangoIds = { min: 22, max: 25 };
                break;
            case 'product-container-section3':
                rangoIds = { min: 26, max: 40 };
                break;
            case 'product-container-section4':
                rangoIds = { min: 18, max: 21 };
                break;
            case 'product-container-section5':
                rangoIds = { min: 41, max: 46 };
                break;
            case 'product-container-section6':
                rangoIds = { min: 47, max: 53 };
                break;
            default:
                console.error('No se ha encontrado un contenedor válido.');
                return;
        }

        // Filtrar los productos según el rango de IDs
        const productosFiltrados = products.filter(producto =>
            producto.id >= rangoIds.min && producto.id <= rangoIds.max
        );

        // Generar HTML para cada producto
        productosFiltrados.forEach(producto => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            card.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <input type="number" class="cantidad-input" data-producto-id="${producto.id}" value="1" min="1">
                <button class="add-to-cart" data-producto-id="${producto.id}">Agregar al carrito</button>
            `;

            contenedor.appendChild(card);
        });

        // Añadir funcionalidad al botón de agregar al carrito
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const productoId = button.getAttribute('data-producto-id');
                const card = button.closest('.product-card');
                const nombreProducto = card.querySelector('h3').textContent;
                const precioText = card.querySelector('p:nth-of-type(2)').textContent;
                const precio = parseFloat(precioText.replace('Precio: $', ''));
                const cantidad = parseInt(card.querySelector('.cantidad-input').value, 10);

                if (!cartItems[productoId]) {
                    cartItems[productoId] = { name: nombreProducto, precio: precio, cantidad: 0 };
                }

                cartItems[productoId].cantidad += cantidad;

                localStorage.setItem('cart', JSON.stringify(cartItems));
                updateCart();
            });
        });
    }

    fetchProducts();

    if (document.getElementById('cart-items')) {
        updateCart();
    }

    if (document.getElementById('hacercompra')) {
        document.getElementById('hacercompra').addEventListener('click', () => {
            let mensaje = 'Hola Marvel, me gustaría hacer el siguiente pedido:\n\n';
            let total = 0;

            for (const productoId in cartItems) {
                if (cartItems.hasOwnProperty(productoId)) {
                    const item = cartItems[productoId];
                    mensaje += `${item.name} 
                    Cantidad: ${item.cantidad}
                    Precio: $${item.precio * item.cantidad}\n`;
                    total += item.precio * item.cantidad;
                }
            }

            mensaje += `\nTotal: $${total}`;

            const phoneNumber = '5493415326060'; 
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(mensaje)}`;

            window.open(whatsappUrl, '_blank');
            cartItems = {};
            localStorage.removeItem('cart');
            updateCart();
        });
    }

    if (document.getElementById('cancel')) {
        document.getElementById('cancel').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cancelar la compra?')) {
                cartItems = {};
                updateCart();
                localStorage.removeItem('cart');
            }
        });
    }

    if (document.getElementById('reclamo-pedido')) {
        document.getElementById('reclamo-pedido').addEventListener('click', () => {
            const reclamomesaje = 'Hola, me gustaría hacer un reclamo:\n\n';
            const phoneNumber = '5493415326060'; 
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(reclamomesaje)}`;

            window.open(whatsappUrl, '_blank');
        });
    }

    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];

    window.onload = function () {
        modal.style.display = "block";
    }

    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    const modalImage = document.getElementById("modal-image");

    function getImageForDay() {
        const day = new Date().getDay();
        const images = [
            "imagenes/DOMINGO.jpg",
            "imagenes/LUNES.jpg",
            "imagenes/MARTES.jpg",
            "imagenes/MIERCOLES.jpg",
            "imagenes/JUEVES.jpg",
            "imagenes/VIERNES.jpg",
            "imagenes/SABADO.jpg"
        ];
        return images[day];
    }

    modalImage.src = getImageForDay();

    function addToCart(productId, quantity) {
        const cartItems = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
    
        // Lógica para añadir el producto al carrito (ajusta esto según tu implementación)
        const listItem = document.createElement('li');
        listItem.textContent = `Producto ID: ${productId}, Cantidad: ${quantity}`;
        cartItems.appendChild(listItem);
    
        // Actualizar el contador de productos
        let currentCount = parseInt(cartCount.textContent.replace('Cantidad de productos: ', ''));
        currentCount += quantity;
        cartCount.textContent = `Cantidad de productos: ${currentCount}`;
    }
    
    // Ejemplo de uso
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-producto-id');
            const quantity = parseInt(button.previousElementSibling.value);
            addToCart(productId, quantity);
        });
    });
});
