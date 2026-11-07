
/* =====================================================
   TROVA - SISTEMA PRINCIPAL
   Supabase, catálogo, filtros, carrito y WhatsApp
===================================================== */

const TROVA = {
    whatsapp: "50370609793",
    currency: "USD",
    storageKey: "trova_cart_v1"
};

/* =====================================================
   DATABASE
===================================================== */

const db = window.trovaSupabase;

let products = [];
let categories = [];
let cart = [];
let catalogInitialized = false;

/* =====================================================
   UTILITIES
===================================================== */

function money(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: TROVA.currency
    }).format(Number(value) || 0);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function safeExternalURL(value) {
    try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol)
            ? url.href
            : "";
    } catch {
        return "";
    }
}

/* =====================================================
   CATEGORY DATABASE
===================================================== */

const categoryNames = {
    tecnologia: "Tecnología",
    ropa: "Ropa",
    calzado: "Calzado",
    belleza: "Belleza",
    accesorios: "Accesorios",
    hogar: "Hogar y cocina",
    juguetes: "Juguetes y niños"
};

const subcategoryNames = {
    dama: "Dama",
    caballero: "Caballero",
    ninos: "Niños"
};

/*
   Convierte los 16 slugs de TROVA
   en categorías para los filtros del catálogo.
*/

function getCategoryInfo(categoryId) {
    const category = categories.find(item => item.id === categoryId);

    if (!category) {
        return {
            category: "",
            subcategory: "",
            audience: "todos",
            label: "General"
        };
    }

    const slug = category.slug;

    const mappings = {
        tecnologia: ["tecnologia", "", "todos"],
        "ropa-dama": ["ropa", "dama", "dama"],
        "accesorios-dama": ["accesorios", "dama", "dama"],
        "calzado-dama": ["calzado", "dama", "dama"],
        "ropa-caballero": ["ropa", "caballero", "caballero"],
        belleza: ["belleza", "", "todos"],
        "calzado-caballero": ["calzado", "caballero", "caballero"],
        "accesorios-caballero": ["accesorios", "caballero", "caballero"],
        ropa: ["ropa", "", "todos"],
        "ropa-ninos": ["ropa", "ninos", "ninos"],
        "accesorios-ninos": ["accesorios", "ninos", "ninos"],
        "calzado-ninos": ["calzado", "ninos", "ninos"],
        calzado: ["calzado", "", "todos"],
        accesorios: ["accesorios", "", "todos"],
        "juguetes-ninos": ["juguetes", "ninos", "ninos"],
        "hogar-cocina": ["hogar", "", "todos"]
    };

    const info = mappings[slug] || ["", "", "todos"];

    return {
        category: info[0],
        subcategory: info[1],
        audience: info[2],
        label: category.name
    };
}

/* =====================================================
   LOAD PRODUCTS AND CATEGORIES FROM SUPABASE
===================================================== */

async function loadStoreData() {
    if (!db) {
        console.error("TROVA: Supabase no está conectado.");
        showToast("No se pudo conectar con la tienda.");
        return;
    }

    try {
        const [categoryResult, productResult] = await Promise.all([
            db.from("categories")
                .select("*")
                .order("position", { ascending: true }),

            db.from("products")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
        ]);

        if (categoryResult.error) throw categoryResult.error;
        if (productResult.error) throw productResult.error;

        categories = categoryResult.data || [];

        products = (productResult.data || []).map(product => {
            const categoryInfo = getCategoryInfo(product.category_id);

            let image = product.image_url || "";

            if (!image && Array.isArray(product.images)) {
                const firstImage = product.images[0];

                image = typeof firstImage === "string"
                    ? firstImage
                    : firstImage?.url || "";
            }

            return {
                id: String(product.id),
                name: product.name || "Producto TROVA",
                category: categoryInfo.category,
                categoryLabel: categoryInfo.label,
                subcategory: categoryInfo.subcategory,
                audience: categoryInfo.audience,
                price: Number(product.price) || 0,
                oldPrice: product.compare_price
                    ? Number(product.compare_price)
                    : null,
                tag: product.is_offer ? "OFERTA" : "",
                featured: !!product.is_featured,
                isNew: false,
                offer: !!product.is_offer,
                image,
                url: product.external_url || "",
                stock: Number(product.stock) || 0
            };
        });

        console.log("TROVA: categorías cargadas:", categories.length);
        console.log("TROVA: productos cargados:", products.length);

        cart = loadCart();

        renderHomeProducts();
        renderCatalog();
        renderCart();

    } catch (error) {
        console.error("TROVA: Error cargando información:", error);
        showToast("No se pudieron cargar los productos.");
    }
}

/* =====================================================
   PRODUCT CARDS
===================================================== */

function productCard(product) {
    const tag = product.tag
        ? `<span class="product-tag">${escapeHTML(product.tag)}</span>`
        : "";

    const oldPrice = product.oldPrice
        ? `<span class="product-old-price">${money(product.oldPrice)}</span>`
        : "";

    const safeURL = safeExternalURL(product.url);

    const image = safeExternalURL(product.image);

    return `
        <article class="product-card">
            <div class="product-image-wrap">
                ${tag}

                ${image
                    ? `<img class="product-image"
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy">`
                    : `<div class="product-image product-no-image">
                        <span>TROVA</span>
                    </div>`
                }
            </div>

            <div class="product-info">
                <p class="product-category">
                    ${escapeHTML(product.categoryLabel)}
                </p>

                <h3>${escapeHTML(product.name)}</h3>

                <div class="product-price">
                    ${money(product.price)} ${oldPrice}
                </div>

                <div class="product-actions">
                    <button class="add-cart"
                        data-add-cart="${escapeHTML(product.id)}">
                        AGREGAR AL CARRITO
                    </button>

                    <a class="product-link"
                        href="${safeURL || "#"}"
                        ${safeURL ? 'target="_blank" rel="noopener noreferrer"' : ""}
                        aria-label="Ver referencia externa">↗</a>
                </div>
            </div>
        </article>
    `;
}

function renderProductList(elementId, list) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = list.length
        ? list.map(productCard).join("")
        : "";
}

/* =====================================================
   HOMEPAGE PRODUCTS
===================================================== */

function renderHomeProducts() {
    renderProductList(
        "featuredProducts",
        products.filter(product => product.featured)
    );

    renderProductList(
        "newProducts",
        products.filter(product => product.isNew).slice(0, 4)
    );
}

/* =====================================================
   CATALOG FILTERS
===================================================== */

const catalogState = {
    category: "",
    subcategory: "",
    audience: "todos",
    search: "",
    sort: "featured",
    offers: false
};

function readCatalogURL() {
    const params = new URLSearchParams(location.search);

    catalogState.category = params.get("categoria") || "";
    catalogState.subcategory = params.get("subcategoria") || "";
    catalogState.offers = params.get("ofertas") === "1";

    if (["dama", "caballero", "ninos"].includes(catalogState.subcategory)) {
        catalogState.audience = catalogState.subcategory;
    }
}

function updateCatalogURL() {
    const params = new URLSearchParams();

    if (catalogState.category) {
        params.set("categoria", catalogState.category);
    }

    if (catalogState.subcategory) {
        params.set("subcategoria", catalogState.subcategory);
    }

    if (catalogState.offers) {
        params.set("ofertas", "1");
    }

    const query = params.toString();

    history.replaceState(
        null,
        "",
        location.pathname + (query ? "?" + query : "")
    );
}

function updateCatalogHeading() {
    const heading = document.getElementById("catalogHeading");
    const description = document.getElementById("catalogDescription");
    const breadcrumb = document.getElementById("currentBreadcrumb");

    if (!heading) return;

    let title = "Todos los productos";

    if (catalogState.offers) {
        title = "Ofertas especiales";
    } else if (catalogState.subcategory) {
        title = subcategoryNames[catalogState.subcategory] || title;
    } else if (catalogState.category) {
        title = categoryNames[catalogState.category] || title;
    }

    heading.textContent = title;

    if (breadcrumb) {
        breadcrumb.textContent = title.toUpperCase();
    }

    if (description) {
        description.textContent = catalogState.category
            ? "Explora nuestra selección de " + title.toLowerCase() + "."
            : "Una selección para cada estilo y necesidad.";
    }

    const filter = document.getElementById("audienceFilter");

    if (filter) {
        filter.style.display =
            ["ropa", "calzado", "accesorios"].includes(catalogState.category)
                ? "flex"
                : "none";
    }

    document.querySelectorAll(".filter-chip").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.audience === catalogState.audience
        );
    });

    document.querySelectorAll(".category-accordion details").forEach(detail => {
        detail.open = detail.dataset.category === catalogState.category;
    });

    document.querySelectorAll("[data-category-filter]").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.category === catalogState.category &&
            (link.dataset.subcategory || "") === catalogState.subcategory
        );
    });
}

function getFilteredProducts() {
    let result = [...products];

    if (catalogState.category) {
        result = result.filter(
            product => product.category === catalogState.category
        );
    }

    if (catalogState.subcategory) {
        result = result.filter(
            product => product.subcategory === catalogState.subcategory
        );
    }

    if (
        catalogState.audience !== "todos" &&
        !catalogState.subcategory
    ) {
        result = result.filter(
            product => product.audience === catalogState.audience
        );
    }

    if (catalogState.offers) {
        result = result.filter(product => product.offer);
    }

    if (catalogState.search) {
        const search = catalogState.search.toLowerCase();

        result = result.filter(product =>
            (
                product.name + " " +
                product.categoryLabel + " " +
                product.category + " " +
                product.subcategory
            ).toLowerCase().includes(search)
        );
    }

    if (catalogState.sort === "low") {
        result.sort((a, b) => a.price - b.price);
    }

    if (catalogState.sort === "high") {
        result.sort((a, b) => b.price - a.price);
    }

    if (catalogState.sort === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (catalogState.sort === "featured") {
        result.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return result;
}

function renderCatalog() {
    const element = document.getElementById("catalogProducts");
    if (!element) return;

    const result = getFilteredProducts();

    element.innerHTML = result.map(productCard).join("");

    const noProducts = document.getElementById("noProducts");
    const count = document.getElementById("resultsCount");

    if (noProducts) {
        noProducts.hidden = result.length !== 0;
    }

    if (count) {
        count.textContent = result.length +
            (result.length === 1
                ? " producto encontrado"
                : " productos encontrados");
    }

    updateCatalogHeading();
}

function initializeCatalog() {
    if (catalogInitialized) return;
    if (!document.getElementById("catalogProducts")) return;

    catalogInitialized = true;

    readCatalogURL();

    const search = document.getElementById("catalogSearch");
    const sort = document.getElementById("sortProducts");

    search?.addEventListener("input", () => {
        catalogState.search = search.value.trim();
        renderCatalog();
    });

    sort?.addEventListener("change", () => {
        catalogState.sort = sort.value;
        renderCatalog();
    });

    document.querySelectorAll("[data-category-filter]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            catalogState.category = link.dataset.category || "";
            catalogState.subcategory = link.dataset.subcategory || "";
            catalogState.audience = "todos";
            catalogState.offers = false;

            updateCatalogURL();
            renderCatalog();
            closeMobileFilters();
        });
    });

    document.querySelectorAll(".filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            catalogState.audience = button.dataset.audience;
            catalogState.subcategory = "";

            updateCatalogURL();
            renderCatalog();
        });
    });

    document.querySelectorAll("[data-reset-catalog]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            resetCatalog();
        });
    });

    document.getElementById("clearSearch")?.addEventListener("click", () => {
        resetCatalog();
    });

    renderCatalog();
}

function resetCatalog() {
    Object.assign(catalogState, {
        category: "",
        subcategory: "",
        audience: "todos",
        search: "",
        sort: "featured",
        offers: false
    });

    const search = document.getElementById("catalogSearch");
    const sort = document.getElementById("sortProducts");

    if (search) search.value = "";
    if (sort) sort.value = "featured";

    updateCatalogURL();
    renderCatalog();
}

/* =====================================================
   CART STORAGE
===================================================== */

function loadCart() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(TROVA.storageKey) || "[]"
        );

        if (!Array.isArray(saved)) return [];

        return saved
            .filter(item =>
                products.some(product => product.id === String(item.id)) &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) > 0
            )
            .map(item => ({
                id: String(item.id),
                quantity: Number(item.quantity)
            }));

    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(TROVA.storageKey, JSON.stringify(cart));
    renderCart();
}

function addToCart(id) {
    const product = products.find(item => item.id === String(id));
    if (!product) return;

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            quantity: 1
        });
    }

    saveCart();
    showToast("Producto agregado a tu carrito.");
}

function changeQuantity(id, amount) {
    const item = cart.find(product => product.id === String(id));
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== String(id));
    }

    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== String(id));
    saveCart();
}

function cartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function cartSubtotal() {
    return cart.reduce((total, item) => {
        const product = products.find(product => product.id === item.id);

        return total + (product ? product.price * item.quantity : 0);
    }, 0);
}

function renderCart() {
    const itemsContainer = document.getElementById("cartItems");
    const total = document.getElementById("cartTotal");
    const counter = document.getElementById("cartCounter");
    const checkout = document.getElementById("checkoutButton");

    if (counter) counter.textContent = cartCount();
    if (total) total.textContent = money(cartSubtotal());

    if (checkout) checkout.disabled = cart.length === 0;

    if (!itemsContainer) return;

    if (!cart.length) {
        itemsContainer.innerHTML = `
            <div class="cart-empty">
                <p style="font-size:35px;margin-bottom:15px">♧</p>
                <h3 style="font-family:Georgia;margin-bottom:8px">
                    Tu carrito está vacío
                </h3>
                <p>Explora TROVA y agrega tus productos favoritos.</p>
            </div>
        `;
        return;
    }

    itemsContainer.innerHTML = cart.map(item => {
        const product = products.find(product => product.id === item.id);
        if (!product) return "";

        const image = safeExternalURL(product.image);

        return `
            <article class="cart-item">
                ${image
                    ? `<img src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.name)}">`
                    : ""
                }

                <div>
                    <h4>${escapeHTML(product.name)}</h4>
                    <p>${money(product.price)}</p>

                    <div class="cart-quantity">
                        <button data-quantity="${escapeHTML(product.id)}"
                            data-change="-1">−</button>

                        <span>${item.quantity}</span>

                        <button data-quantity="${escapeHTML(product.id)}"
                            data-change="1">+</button>
                    </div>
                </div>

                <button class="cart-remove"
                    data-remove="${escapeHTML(product.id)}"
                    aria-label="Eliminar producto">×</button>
            </article>
        `;
    }).join("");
}

/* =====================================================
   CART EVENTS
===================================================== */

function openCart() {
    document.getElementById("cartDrawer")?.classList.add("open");
    document.getElementById("cartOverlay")?.classList.add("open");
}

function closeCart() {
    document.getElementById("cartDrawer")?.classList.remove("open");
    document.getElementById("cartOverlay")?.classList.remove("open");
}

function initializeCart() {
    renderCart();

    document.getElementById("openCart")?.addEventListener("click", openCart);
    document.getElementById("closeCart")?.addEventListener("click", closeCart);
    document.getElementById("cartOverlay")?.addEventListener("click", closeCart);

    document.getElementById("checkoutButton")
        ?.addEventListener("click", checkoutWhatsApp);

    document.addEventListener("click", event => {
        const addButton = event.target.closest("[data-add-cart]");

        if (addButton) {
            addToCart(addButton.dataset.addCart);
        }

        const quantityButton = event.target.closest("[data-quantity]");

        if (quantityButton) {
            changeQuantity(
                quantityButton.dataset.quantity,
                Number(quantityButton.dataset.change)
            );
        }

        const removeButton = event.target.closest("[data-remove]");

        if (removeButton) {
            removeFromCart(removeButton.dataset.remove);
            showToast("Producto eliminado.");
        }
    });
}

/* =====================================================
   WHATSAPP ORDER
===================================================== */

function checkoutWhatsApp() {
    if (!cart.length) {
        showToast("Agrega productos antes de continuar.");
        return;
    }

    const customerName = (prompt("Nombre completo del cliente:") || "").trim();

    if (!customerName) {
        showToast("Es necesario ingresar el nombre del cliente.");
        return;
    }

    const customerPhone = (prompt("Teléfono de contacto:") || "").trim();

    if (!customerPhone) {
        showToast("Es necesario ingresar un teléfono de contacto.");
        return;
    }

    const customerCity = (prompt("Ciudad o municipio:") || "").trim();

    if (!customerCity) {
        showToast("Es necesario ingresar la ciudad.");
        return;
    }

    const deliveryChoice = prompt(
        "Modalidad de entrega:\nEscribe DOMICILIO o PUNTO DE ENTREGA",
        "DOMICILIO"
    );

    if (deliveryChoice === null) return;

    const deliveryMode = deliveryChoice.trim().toLowerCase();

    if (!["domicilio", "punto de entrega", "punto"].includes(deliveryMode)) {
        showToast("Escribe DOMICILIO o PUNTO DE ENTREGA.");
        return;
    }

    const deliveryAddress = (prompt(
        deliveryMode === "domicilio"
            ? "Dirección completa para la entrega:"
            : "Indica el punto de entrega:"
    ) || "").trim();

    if (!deliveryAddress) {
        showToast("Indica la dirección o el punto de entrega.");
        return;
    }

    const observations = (
        prompt("Observaciones (opcional):", "Ninguna") || "Ninguna"
    ).trim() || "Ninguna";

    const subtotal = cartSubtotal();
    const deposit = subtotal * 0.50;
    const balance = subtotal - deposit;

    const lines = cart.map(item => {
        const product = products.find(product => product.id === item.id);

        if (!product) return "";

        return `- ${product.name} | Cantidad: ${item.quantity} | Precio unitario: ${money(product.price)} | Subtotal: ${money(product.price * item.quantity)}`;
    }).filter(Boolean);

    const message = [
        "NUEVA SOLICITUD DE COMPRA - TROVA",
        "",
        "CLIENTE",
        `Nombre: ${customerName}`,
        `Teléfono: ${customerPhone}`,
        `Ciudad: ${customerCity}`,
        "",
        "PRODUCTOS SOLICITADOS",
        ...lines,
        "",
        "RESUMEN DE COMPRA",
        `Total estimado: ${money(subtotal)}`,
        "Modalidad de pago: 50% anticipo y 50% contra entrega",
        `Anticipo estimado: ${money(deposit)}`,
        `Saldo estimado: ${money(balance)}`,
        "",
        "INFORMACIÓN DE ENTREGA",
        `Modalidad: ${deliveryMode === "domicilio" ? "Domicilio" : "Punto de entrega"}`,
        `Dirección o punto: ${deliveryAddress}`,
        "",
        "OBSERVACIONES",
        observations,
        "",
        "IMPORTANTE",
        "Los precios y la disponibilidad deben ser confirmados por TROVA.",
        "Esta solicitud no representa una compra confirmada.",
        "",
        "¡Gracias por elegir TROVA!"
    ].join("\n");

    const whatsappURL =
        "https://wa.me/" + TROVA.whatsapp +
        "?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank", "noopener");
}

/* =====================================================
   EXTERNAL PRODUCT REQUEST
===================================================== */

function initializeExternalRequest() {
    const form = document.getElementById("externalProductForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = form.elements.product.value.trim();
        const link = form.elements.link.value.trim();
        const details = form.elements.details.value.trim();

        const quantityField = form.elements.quantity;

        const quantityValue = quantityField
            ? Number(quantityField.value)
            : 1;

        const quantity =
            Number.isInteger(quantityValue) && quantityValue > 0
                ? quantityValue
                : 1;

        const safeLink = safeExternalURL(link);

        if (!name || !safeLink) {
            showToast("Revisa el nombre y el enlace del producto.");
            return;
        }

        const message = [
            "SOLICITUD DE PRODUCTO EXTERNO - TROVA",
            "",
            `Producto: ${name}`,
            `Cantidad: ${quantity}`,
            `Enlace: ${safeLink}`,
            "",
            "Comentarios:",
            details || "Sin comentarios",
            "",
            "Solicito información sobre disponibilidad y precio.",
            "",
            "¡Gracias por su atención!"
        ].join("\n");

        const whatsappURL =
            "https://wa.me/" + TROVA.whatsapp +
            "?text=" + encodeURIComponent(message);

        window.open(whatsappURL, "_blank", "noopener");
    });
}

/* =====================================================
   MOBILE NAVIGATION
===================================================== */

function initializeNavigation() {
    const button = document.getElementById("mobileNavToggle");
    const nav = document.querySelector(".main-nav");

    button?.addEventListener("click", () => {
        nav?.classList.toggle("mobile-open");
    });

    nav?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("mobile-open");
        });
    });
}

/* =====================================================
   MOBILE FILTERS
===================================================== */

function closeMobileFilters() {
    document.getElementById("catalogSidebar")
        ?.classList.remove("mobile-open");
}

function initializeMobileFilters() {
    document.getElementById("mobileFilterToggle")
        ?.addEventListener("click", () => {
            document.getElementById("catalogSidebar")
                ?.classList.add("mobile-open");
        });

    document.getElementById("closeFilters")
        ?.addEventListener("click", closeMobileFilters);
}

/* =====================================================
   INITIALIZE EVERYTHING
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    initializeCatalog();
    initializeCart();
    initializeExternalRequest();
    initializeNavigation();
    initializeMobileFilters();

    await loadStoreData();

    // Actualiza el catálogo después de cargar Supabase.
    renderHomeProducts();
    renderCatalog();
    renderCart();
});
