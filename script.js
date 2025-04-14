const productosIniciales = [
    { id: 1, nombre: "Nike Court Legacy", precio: 74.99, categoria: "Nike", imagen: "https://media.revistagq.com/photos/6320978363fed477223708fe/3:4/w_640,c_limit/Captura%20de%20pantalla%202022-09-13%20a%20las%2016.45.00.png" },
    { id: 2, nombre: "Nike Air Max Plus", precio: 189.99, categoria: "Nike", imagen: "https://media.revistagq.com/photos/63209725e47c249868910277/3:4/w_640,c_limit/Captura%20de%20pantalla%202022-09-13%20a%20las%2016.43.08.png" },
    { id: 3, nombre: "Nike Air Force 1 '07", precio: 119.99, categoria: "Nike", imagen: "https://media.revistagq.com/photos/6320966663fed477223708fb/3:4/w_640,c_limit/Captura%20de%20pantalla%202022-09-13%20a%20las%2016.35.37.png" },
    { id: 4, nombre: "Adidas Samba Vegan", precio: 100.00, categoria: "Adidas", imagen: "https://media.revistagq.com/photos/63209a2f63fed47722370904/3:4/w_640,c_limit/Captura%20de%20pantalla%202022-09-13%20a%20las%2016.52.59.png" },
    { id: 5, nombre: "Vans Authentic", precio: 70.00, categoria: "Vans", imagen: "https://media.revistagq.com/photos/63209dc1dfabb92b4903fa7e/3:4/w_640,c_limit/Captura%20de%20pantalla%202022-09-13%20a%20las%2017.06.17.png" },
    { id: 6, nombre: "UA HOVR Machina 3 Storm", precio: 170.00, categoria: "Under Armour", imagen: "https://media.revistagq.com/photos/6321d4ba504ebd882c04f457/3:4/w_640,c_limit/Captura%20de%20pantalla%202022-09-14%20a%20las%2015.11.21.png" },
    { id: 7, nombre: "Converse Chuck 70 Classic", precio: 90.00, categoria: "Converse", imagen: "https://media.revistagq.com/photos/6320a318504ebd882c04f413/3:4/w_640,c_limit/Captura%20de%20pantalla%202022-09-13%20a%20las%2017.31.35.png" },
];

let carrito = new Map();

const contenedorProductos = document.getElementById("productos");
const listaCarritoElement = document.getElementById("lista-carrito");
const totalCarritoElement = document.getElementById("total");
const cantidadCarritoElement = document.getElementById("cantidad-carrito");
const contenedorPayPal = document.getElementById("paypal-button-container");
const filtroCategoria = document.getElementById("categoria");

function filtrarPorCategoria() {
    const seleccion = filtroCategoria.value;
    const productosFiltrados =
        seleccion === "todos"
            ? productosIniciales
            : productosIniciales.filter((p) => p.categoria === seleccion);

    mostrarProductos(productosFiltrados);
}

function mostrarProductos(productos) {
    contenedorProductos.innerHTML = "";
    productos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto";
        div.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}">
            <h3>${prod.nombre}</h3>
            <p>Precio: $${prod.precio.toFixed(2)}</p>
            <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
        `;
        contenedorProductos.appendChild(div);
    });
}

function agregarAlCarrito(id) {
    const producto = productosIniciales.find((p) => p.id === id);
    if (!producto) return;

    if (carrito.has(id)) {
        carrito.get(id).cantidad++;
    } else {
        carrito.set(id, { ...producto, cantidad: 1 });
    }

    guardarCarrito();
    actualizarCarrito();
}

function actualizarCarrito() {
    listaCarritoElement.innerHTML = "";
    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
            <button onclick="eliminarDelCarrito(${item.id})">❌</button>
        `;
        listaCarritoElement.appendChild(li);
        total += item.precio * item.cantidad;
        cantidadTotal += item.cantidad;
    });

    totalCarritoElement.textContent = total.toFixed(2);
    cantidadCarritoElement.textContent = cantidadTotal;
    contenedorPayPal.style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
    if (!carrito.has(id)) return;

    let item = carrito.get(id);
    if (item.cantidad > 1) {
        item.cantidad--;
    } else {
        carrito.delete(id);
    }

    guardarCarrito();
    actualizarCarrito();
}

function vaciarCarrito() {
    if (carrito.size === 0) return;

    if (confirm("¿Seguro que quieres vaciar el carrito?")) {
        carrito.clear();
        guardarCarrito();
        actualizarCarrito();
    }
}

function finalizarCompra() {
    if (carrito.size === 0) {
        alert("Tu carrito está vacío. Agrega zapatillas antes de comprar.");
        return;
    }

    alert("¡Gracias por tu compra! 👟 Tu pedido está en camino.");
    vaciarCarrito();
}

function guardarCarrito() {
    localStorage.setItem(
        "carrito",
        JSON.stringify(Array.from(carrito.entries()))
    );
}

function cargarCarrito() {
    const data = localStorage.getItem("carrito");
    if (data) {
        carrito = new Map(JSON.parse(data));
        actualizarCarrito();
    }
}

// PayPal Smart Button
if (window.paypal) {
    paypal
        .Buttons({
            createOrder: function (data, actions) {
                const total = Array.from(carrito.values()).reduce(
                    (acc, item) => acc + item.precio * item.cantidad,
                    0
                );
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: total.toFixed(2)
                            }
                        }
                    ]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    alert(
                        `¡Gracias ${details.payer.name.given_name}, tu pago fue exitoso! 👟`
                    );
                    vaciarCarrito();
                });
            },
            onError: function (err) {
                console.error("Error con PayPal:", err);
                alert("Hubo un problema con el pago. Intenta de nuevo.");
            }
        })
        .render("#paypal-button-container");
}

// Inicializar
filtrarPorCategoria();
cargarCarrito();
