
/* ==========================================
   TROVA - SISTEMA DE PRODUCTOS Y CARRITO
   Versión inicial de pruebas
========================================== */

/* CONFIGURACIÓN */

const TROVA_CONFIG = {
    whatsapp: "50370609793",
    moneda: "USD",
    simbolo: "$"
};

/* PRODUCTOS TEMPORALES */

const productos = [
    {
        id: 1,
        nombre: "Producto de tecnología",
        descripcion: "Producto de prueba para nuestro catálogo.",
        categoria: "Tecnología",
        precio: 25,
        precioAnterior: 35,
        etiqueta: "OFERTA"
    },
    {
        id: 2,
        nombre: "Accesorio de belleza",
        descripcion: "Producto de prueba para nuestra tienda.",
        categoria: "Belleza",
        precio: 12,
        precioAnterior: null,
        etiqueta: "NUEVO"
    },
    {
        id: 3,
        nombre: "Accesorio de moda",
        descripcion: "Un artículo de prueba para TROVA.",
        categoria: "Moda y accesorios",
        precio: 18,
        precioAnterior: 25,
        etiqueta: "OFERTA"
    },
    {
        id: 4,
        nombre: "Artículo para el hogar",
        descripcion: "Producto de prueba para nuestro catálogo.",
        categoria: "Hogar y cocina",
        precio: 30,
        precioAnterior: null,
        etiqueta: ""
    }
];

/* CARRITO */

let carrito = [];

try {
    carrito = JSON.parse(localStorage.getItem("trova_carrito")) || [];
    if (!Array.isArray(carrito)) carrito = [];
} catch (error) {
    carrito = [];
}

/* FORMATO DE PRECIOS */

function formatoPrecio(precio) {
    return TROVA_CONFIG.simbolo + Number(precio).toFixed(2);
}

/* GUARDAR CARRITO */

function guardarCarrito() {
    localStorage.setItem("trova_carrito", JSON.stringify(carrito));
    actualizarCarrito();
}

/* AGREGAR PRODUCTOS */

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);

    if (!producto) return;

    const existente = carrito.find(p => p.id === id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }

    guardarCarrito();
    mostrarNotificacion("Producto agregado a tu solicitud.");
}

/* CAMBIAR CANTIDADES */

function cambiarCantidad(id, cambio) {
    const producto = carrito.find(p => p.id === id);

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter(p => p.id !== id);
    }

    guardarCarrito();
}

/* ELIMINAR PRODUCTO */

function eliminarProducto(id) {
    carrito = carrito.filter(p => p.id !== id);
    guardarCarrito();
}

/* CALCULAR TOTAL */

function calcularTotal() {
    return carrito.reduce(
        (total, producto) => total + producto.precio * producto.cantidad,
        0
    );
}

/* CANTIDAD TOTAL DE ARTÍCULOS */

function cantidadTotal() {
    return carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
    );
}

/* NOTIFICACIONES */

function mostrarNotificacion(mensaje) {
    const notificacion = document.getElementById("trova-notificacion");

    if (!notificacion) return;

    notificacion.textContent = mensaje;
    notificacion.classList.add("activa");

    setTimeout(() => {
        notificacion.classList.remove("activa");
    }, 2500);
}

/* ESTILOS DEL SISTEMA */

function crearEstilos() {
    const estilos = document.createElement("style");

    estilos.textContent = `
        .trova-productos-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 22px;
        }

        .trova-producto {
            background: #fff;
            border: 1px solid #e8e2d8;
            overflow: hidden;
        }

        .trova-producto-imagen {
            height: 210px;
            background: #f1ede5;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9b896e;
            font-family: Georgia, serif;
            font-size: 17px;
        }

        .trova-producto-info {
            padding: 20px;
        }

        .trova-etiqueta {
            color: #a98750;
            font-size: 10px;
            letter-spacing: 2px;
        }

        .trova-producto h3 {
            font-family: Georgia, serif;
            font-weight: normal;
            font-size: 20px;
            margin: 9px 0;
        }

        .trova-producto p {
            color: #777;
            font-size: 13px;
            margin-bottom: 12px;
        }

        .trova-precios {
            margin-bottom: 15px;
        }

        .trova-precio {
            color: #171717;
            font-weight: bold;
            font-size: 18px;
        }

        .trova-precio-anterior {
            color: #999;
            text-decoration: line-through;
            font-size: 13px;
            margin-left: 8px;
        }

        .trova-agregar {
            width: 100%;
            border: 1px solid #c5a46d;
            background: #171717;
            color: #fff;
            padding: 12px;
            cursor: pointer;
            letter-spacing: 1px;
            font-size: 11px;
            transition: .3s;
        }

        .trova-agregar:hover {
            background: #c5a46d;
            color: #171717;
        }

        .trova-carrito-boton {
            position: fixed;
            right: 25px;
            bottom: 25px;
            z-index: 1000;
            background: #171717;
            color: white;
            border: 1px solid #c5a46d;
            padding: 16px 22px;
            cursor: pointer;
            font-size: 13px;
        }

        .trova-carrito-boton span {
            color: #c5a46d;
            margin-left: 8px;
        }

        .trova-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 2000;
            background: rgba(0,0,0,.7);
            justify-content: center;
            align-items: center;
            padding: 15px;
        }

        .trova-modal.activo {
            display: flex;
        }

        .trova-modal-contenido {
            background: #f1ede5;
            width: 100%;
            max-width: 570px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 30px;
            position: relative;
        }

        .trova-modal-contenido h2 {
            font-family: Georgia, serif;
            font-weight: normal;
            margin-bottom: 20px;
        }

        .trova-cerrar {
            position: absolute;
            top: 15px;
            right: 20px;
            border: none;
            background: none;
            font-size: 25px;
            cursor: pointer;
        }

        .trova-item-carrito {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid #d8d0c4;
            padding: 15px 0;
        }

        .trova-item-carrito strong {
            font-family: Georgia, serif;
            font-weight: normal;
        }

        .trova-cantidad {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .trova-cantidad button {
            width: 27px;
            height: 27px;
            border: 1px solid #c5a46d;
            background: white;
            cursor: pointer;
        }

        .trova-eliminar {
            color: #9b3434;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 12px;
        }

        .trova-total {
            display: flex;
            justify-content: space-between;
            font-size: 19px;
            font-weight: bold;
            margin: 22px 0;
        }

        .trova-formulario {
            display: grid;
            gap: 12px;
        }

        .trova-formulario input,
        .trova-formulario select,
        .trova-formulario textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d5cbbd;
            background: white;
            font: inherit;
        }

        .trova-formulario textarea {
            resize: vertical;
        }

        .trova-whatsapp {
            width: 100%;
            padding: 15px;
            border: none;
            background: #171717;
            color: white;
            cursor: pointer;
            letter-spacing: 1px;
            margin-top: 15px;
        }

        .trova-whatsapp:hover {
            background: #c5a46d;
            color: #171717;
        }

        .trova-notificacion {
            position: fixed;
            bottom: 90px;
            right: 25px;
            z-index: 3000;
            background: #171717;
            color: white;
            padding: 14px 20px;
            border-left: 3px solid #c5a46d;
            opacity: 0;
            pointer-events: none;
            transition: .3s;
        }

        .trova-notificacion.activa {
            opacity: 1;
        }

        @media(max-width: 900px) {
            .trova-productos-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media(max-width: 480px) {
            .trova-productos-grid {
                grid-template-columns: 1fr;
            }

            .trova-modal-contenido {
                padding: 22px 16px;
            }

            .trova-carrito-boton {
                right: 15px;
                bottom: 15px;
            }
        }
    `;

    document.head.appendChild(estilos);
}

/* MOSTRAR PRODUCTOS */

function mostrarProductos() {
    const contenedor = document.querySelector(".productos-contenido");

    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="trova-productos-grid">
            ${productos.map(producto => `
                <article class="trova-producto">

                    <div class="trova-producto-imagen">
                        TROVA
                    </div>

                    <div class="trova-producto-info">

                        <span class="trova-etiqueta">
                            ${producto.etiqueta || producto.categoria}
                        </span>

                        <h3>${producto.nombre}</h3>

                        <p>${producto.descripcion}</p>

                        <div class="trova-precios">
                            <span class="trova-precio">
                                ${formatoPrecio(producto.precio)}
                            </span>

                            ${producto.precioAnterior ? `
                                <span class="trova-precio-anterior">
                                    ${formatoPrecio(producto.precioAnterior)}
                                </span>
                            ` : ""}
                        </div>

                        <button class="trova-agregar"
                            data-agregar="${producto.id}">
                            AGREGAR A MI SOLICITUD
                        </button>

                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

/* CREAR INTERFAZ DEL CARRITO */

function crearInterfazCarrito() {
    document.body.insertAdjacentHTML("beforeend", `
        <button class="trova-carrito-boton" id="abrir-carrito">
            MI SOLICITUD
            <span id="contador-carrito">0</span>
        </button>

        <div class="trova-modal" id="modal-carrito">
            <div class="trova-modal-contenido">

                <button class="trova-cerrar" id="cerrar-carrito">
                    &times;
                </button>

                <h2>Mi solicitud TROVA</h2>

                <div id="lista-carrito"></div>

                <div class="trova-total">
                    <span>Total estimado</span>
                    <span id="total-carrito">$0.00</span>
                </div>

                <p style="font-size:12px;color:#777;margin-bottom:20px;">
                    Los precios son estimados y deberán confirmarse
                    antes de autorizar la compra.
                </p>

                <h3 style="font-family:Georgia;margin-bottom:15px;">
                    Datos de tu pedido
                </h3>

                <form class="trova-formulario" id="formulario-pedido">

                    <input type="text" id="cliente-nombre"
                        placeholder="Nombre completo" required>

                    <input type="tel" id="cliente-telefono"
                        placeholder="Número de teléfono" required>

                    <input type="text" id="cliente-ciudad"
                        placeholder="Ciudad o municipio" required>

                    <select id="tipo-entrega" required>
                        <option value="">Modalidad de entrega</option>
                        <option value="Domicilio">Entrega a domicilio</option>
                        <option value="Punto de encuentro">Punto de encuentro</option>
                    </select>

                    <input type="text" id="direccion-entrega"
                        placeholder="Dirección o punto de encuentro">

                    <select id="tipo-pago" required>
                        <option value="">Modalidad de pago</option>
                        <option value="total">Pago total anticipado</option>
                        <option value="mitad">50% de anticipo y 50% contra entrega</option>
                    </select>

                    <textarea id="observaciones"
                        rows="3"
                        placeholder="Observaciones adicionales"></textarea>

                    <button type="submit" class="trova-whatsapp">
                        PREPARAR PEDIDO EN WHATSAPP
                    </button>

                </form>

            </div>
        </div>

        <div class="trova-notificacion" id="trova-notificacion"></div>
    `);
}

/* ACTUALIZAR INTERFAZ */

function actualizarCarrito() {
    const contador = document.getElementById("contador-carrito");
    const lista = document.getElementById("lista-carrito");
    const totalElemento = document.getElementById("total-carrito");

    if (!contador || !lista || !totalElemento) return;

    contador.textContent = cantidadTotal();
    totalElemento.textContent = formatoPrecio(calcularTotal());

    if (carrito.length === 0) {
        lista.innerHTML = `
            <p style="padding:20px 0;color:#777;">
                Tu solicitud todavía está vacía.
            </p>
        `;
        return;
    }

    lista.innerHTML = carrito.map(producto => `
        <div class="trova-item-carrito">

            <div>
                <strong>${producto.nombre}</strong>
                <p style="font-size:13px;color:#777;">
                    ${formatoPrecio(producto.precio)} por unidad
                </p>
            </div>

            <div class="trova-cantidad">
                <button data-cantidad="${producto.id}" data-cambio="-1">−</button>
                <span>${producto.cantidad}</span>
                <button data-cantidad="${producto.id}" data-cambio="1">+</button>
            </div>

            <button class="trova-eliminar"
                data-eliminar="${producto.id}">
                Eliminar
            </button>

        </div>
    `).join("");
}

/* ABRIR Y CERRAR CARRITO */

function abrirCarrito() {
    document.getElementById("modal-carrito").classList.add("activo");
}

function cerrarCarrito() {
    document.getElementById("modal-carrito").classList.remove("activo");
}

/* PREPARAR PEDIDO PARA WHATSAPP */

function prepararPedido(evento) {
    evento.preventDefault();

    if (carrito.length === 0) {
        mostrarNotificacion("Agrega productos antes de continuar.");
        return;
    }

    const nombre = document.getElementById("cliente-nombre").value.trim();
    const telefono = document.getElementById("cliente-telefono").value.trim();
    const ciudad = document.getElementById("cliente-ciudad").value.trim();
    const entrega = document.getElementById("tipo-entrega").value;
    const direccion = document.getElementById("direccion-entrega").value.trim();
    const pago = document.getElementById("tipo-pago").value;
    const observaciones = document.getElementById("observaciones").value.trim();

    if (!nombre || !telefono || !ciudad || !entrega || !pago) {
        mostrarNotificacion("Completa los datos obligatorios.");
        return;
    }

    const total = calcularTotal();

    const anticipo = pago === "total" ? total : total * 0.5;
    const saldo = total - anticipo;

    const detalleProductos = carrito.map(producto =>
        `- ${producto.nombre} | Cantidad: ${producto.cantidad} | Subtotal: ${formatoPrecio(producto.precio * producto.cantidad)}`
    ).join("\n");

    const mensaje = `
NUEVA SOLICITUD DE COMPRA - TROVA

CLIENTE
Nombre: ${nombre}
Teléfono: ${telefono}
Ciudad: ${ciudad}

PRODUCTOS
${detalleProductos}

RESUMEN
Total estimado: ${formatoPrecio(total)}
Modalidad de pago: ${pago === "total" ? "Pago total anticipado" : "50% anticipo y 50% contra entrega"}
Anticipo estimado: ${formatoPrecio(anticipo)}
Saldo estimado: ${formatoPrecio(saldo)}

ENTREGA
Modalidad: ${entrega}
Dirección o punto: ${direccion || "Por confirmar"}

OBSERVACIONES
${observaciones || "Ninguna"}

IMPORTANTE:
Los precios y la disponibilidad deben ser confirmados por TROVA.
Esta solicitud no representa una compra confirmada.
    `.trim();

    if (!TROVA_CONFIG.whatsapp) {
        mostrarNotificacion("Falta configurar el WhatsApp oficial de TROVA.");

        console.log("MENSAJE DE PEDIDO PARA WHATSAPP:");
        console.log(mensaje);

        alert("El pedido de prueba se preparó correctamente. Todavía debemos configurar el número oficial de WhatsApp. Puedes revisar el mensaje en la consola del navegador (F12).");
        return;
    }

    const numero = TROVA_CONFIG.whatsapp.replace(/\D/g, "");

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank", "noopener,noreferrer");
}

/* EVENTOS */

function configurarEventos() {

    document.addEventListener("click", evento => {

        const agregar = evento.target.closest("[data-agregar]");

        if (agregar) {
            agregarAlCarrito(Number(agregar.dataset.agregar));
            return;
        }

        const cantidad = evento.target.closest("[data-cantidad]");

        if (cantidad) {
            cambiarCantidad(
                Number(cantidad.dataset.cantidad),
                Number(cantidad.dataset.cambio)
            );
            return;
        }

        const eliminar = evento.target.closest("[data-eliminar]");

        if (eliminar) {
            eliminarProducto(Number(eliminar.dataset.eliminar));
        }
    });

    document.getElementById("abrir-carrito")
        .addEventListener("click", abrirCarrito);

    document.getElementById("cerrar-carrito")
        .addEventListener("click", cerrarCarrito);

    document.getElementById("modal-carrito")
        .addEventListener("click", evento => {
            if (evento.target.id === "modal-carrito") {
                cerrarCarrito();
            }
        });

    document.getElementById("formulario-pedido")
        .addEventListener("submit", prepararPedido);
}

/* INICIAR TROVA */

function iniciarTROVA() {
    crearEstilos();
    mostrarProductos();
    crearInterfazCarrito();
    configurarEventos();
    actualizarCarrito();

    console.log("TROVA: carrito y productos de prueba iniciados.");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarTROVA);
} else {
    iniciarTROVA();
}
