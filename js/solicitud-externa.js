 
/* ======================================
   TROVA - SOLICITUDES EXTERNAS
====================================== */

const TROVA_WHATSAPP = "50370609793";

function crearSolicitudExterna() {
    const productos = document.getElementById("productos");

    if (!productos) return;

    const seccion = document.createElement("section");

    seccion.id = "solicitar-producto";
    seccion.className = "seccion seccion-crema";

    seccion.innerHTML = `
        <div class="contenedor">

            <p class="etiqueta-seccion">TROVA TE AYUDA</p>

            <h2 class="titulo-seccion">
                ¿No encuentras lo que buscas?
            </h2>

            <p class="subtitulo-seccion">
                Comparte con nosotros el producto que deseas
                y revisaremos cómo conseguirlo.
            </p>

            <form id="formulario-externo"
                  style="max-width:650px;margin:auto;display:grid;gap:15px;">

                <input
                    type="url"
                    id="enlace-externo"
                    placeholder="Pega aquí el enlace del producto (opcional)"
                    style="padding:14px;border:1px solid #d5cbbd;"
                >

                <input
                    type="text"
                    id="nombre-externo"
                    placeholder="¿Qué producto estás buscando?"
                    required
                    style="padding:14px;border:1px solid #d5cbbd;"
                >

                <input
                    type="number"
                    id="cantidad-externa"
                    placeholder="Cantidad que deseas"
                    min="1"
                    max="100"
                    value="1"
                    required
                    style="padding:14px;border:1px solid #d5cbbd;"
                >

                <textarea
                    id="comentarios-externos"
                    placeholder="Detalles adicionales, color, talla, modelo..."
                    rows="4"
                    style="padding:14px;border:1px solid #d5cbbd;"
                ></textarea>

                <button
                    type="submit"
                    class="trova-whatsapp"
                    style="background:#171717;color:white;padding:16px;border:1px solid #c5a46d;cursor:pointer;"
                >
                    SOLICITAR ESTE PRODUCTO
                </button>

            </form>

            <p style="text-align:center;font-size:12px;color:#777;margin-top:18px;">
                La disponibilidad y el precio serán confirmados
                por nuestro equipo.
            </p>

        </div>
    `;

    productos.insertAdjacentElement("afterend", seccion);

    document.getElementById("formulario-externo")
        .addEventListener("submit", enviarSolicitudExterna);
}

function enviarSolicitudExterna(evento) {
    evento.preventDefault();

    const enlace = document.getElementById("enlace-externo").value.trim();
    const nombre = document.getElementById("nombre-externo").value.trim();
    const cantidad = Number(document.getElementById("cantidad-externa").value);
    const comentarios = document.getElementById("comentarios-externos").value.trim();

    if (!nombre || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 100) {
        alert("Revisa el nombre del producto y la cantidad.");
        return;
    }

    if (enlace) {
        try {
            const url = new URL(enlace);

            if (url.protocol !== "https:" && url.protocol !== "http:") {
                throw new Error("Enlace no válido");
            }
        } catch {
            alert("Por favor, introduce un enlace válido.");
            return;
        }
    }

    const mensaje = `
SOLICITUD DE PRODUCTO EXTERNO - TROVA

Producto: ${nombre}
Cantidad: ${cantidad}
Enlace: ${enlace || "No proporcionado"}

Comentarios:
${comentarios || "Sin comentarios"}

Solicito información sobre disponibilidad y precio.
    `.trim();

    if (!TROVA_WHATSAPP) {
        console.log("SOLICITUD EXTERNA:", mensaje);

        alert(
            "¡Solicitud preparada! Todavía debemos configurar el WhatsApp oficial de TROVA."
        );

        return;
    }

    const numero = TROVA_WHATSAPP.replace(/\D/g, "");

    window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
        "_blank",
        "noopener,noreferrer"
    );
}

crearSolicitudExterna();
