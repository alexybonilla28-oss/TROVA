
/* =====================================================
   TROVA - SISTEMA PRINCIPAL
   Productos, catálogo, filtros, carrito y WhatsApp
===================================================== */

const TROVA = {
    whatsapp: "50370609793",
    currency: "USD",
    storageKey: "trova_cart_v1"
};

/* =====================================================
   PRODUCT DATABASE
   Cambia nombres, precios, fotos y enlaces aquí.
===================================================== */

const products = [

    {
        id: 1,
        name: "Audífonos inalámbricos Bluetooth",
        category: "tecnologia",
        subcategory: "audio",
        audience: "todos",
        price: 18.50,
        oldPrice: 25,
        tag: "MÁS SOLICITADO",
        featured: true,
        isNew: false,
        offer: true,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=wireless+bluetooth+headphones"
    },
    {
        id: 2,
        name: "Bolso elegante de dama",
        category: "accesorios",
        subcategory: "bolsos",
        audience: "dama",
        price: 24.99,
        oldPrice: null,
        tag: "DESTACADO",
        featured: true,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=women+handbag"
    },
    {
        id: 3,
        name: "Tenis deportivos modernos",
        category: "calzado",
        subcategory: "caballero",
        audience: "caballero",
        price: 39.99,
        oldPrice: 49.99,
        tag: "OFERTA",
        featured: true,
        isNew: false,
        offer: true,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=mens+sport+sneakers"
    },
    {
        id: 4,
        name: "Set de cuidado facial",
        category: "belleza",
        subcategory: "skincare",
        audience: "todos",
        price: 16.99,
        oldPrice: null,
        tag: "NOVEDAD",
        featured: true,
        isNew: true,
        offer: false,
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=skincare+set"
    },
    {
        id: 5,
        name: "Reloj de diseño clásico",
        category: "accesorios",
        subcategory: "relojes",
        audience: "caballero",
        price: 29.99,
        oldPrice: null,
        tag: "DESTACADO",
        featured: true,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=classic+wrist+watch"
    },
    {
        id: 6,
        name: "Lámpara decorativa moderna",
        category: "hogar",
        subcategory: "decoracion",
        audience: "todos",
        price: 21.50,
        oldPrice: 27.50,
        tag: "OFERTA",
        featured: false,
        isNew: true,
        offer: true,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=modern+decorative+lamp"
    },
    {
        id: 7,
        name: "Vestido casual de dama",
        category: "ropa",
        subcategory: "dama",
        audience: "dama",
        price: 22.99,
        oldPrice: null,
        tag: "NOVEDAD",
        featured: false,
        isNew: true,
        offer: false,
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=womens+casual+dress"
    },
    {
        id: 8,
        name: "Camiseta casual para caballero",
        category: "ropa",
        subcategory: "caballero",
        audience: "caballero",
        price: 14.99,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=mens+casual+tshirt"
    },
    {
        id: 9,
        name: "Kit de bloques educativos",
        category: "juguetes",
        subcategory: "educativos",
        audience: "ninos",
        price: 19.99,
        oldPrice: null,
        tag: "FAMILIAR",
        featured: false,
        isNew: true,
        offer: false,
        image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=educational+building+blocks"
    },
    {
        id: 10,
        name: "Mochila escolar infantil",
        category: "juguetes",
        subcategory: "infantil",
        audience: "ninos",
        price: 23.50,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=kids+school+backpack"
    },
    {
        id: 11,
        name: "Smartwatch deportivo",
        category: "tecnologia",
        subcategory: "gadgets",
        audience: "todos",
        price: 34.99,
        oldPrice: 44.99,
        tag: "OFERTA",
        featured: false,
        isNew: false,
        offer: true,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=sport+smartwatch"
    },
    {
        id: 12,
        name: "Set de pulseras minimalistas",
        category: "accesorios",
        subcategory: "joyeria",
        audience: "dama",
        price: 12.50,
        oldPrice: null,
        tag: "NOVEDAD",
        featured: false,
        isNew: true,
        offer: false,
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=minimalist+bracelets"
    },
    {
        id: 13,
        name: "Tenis casuales para dama",
        category: "calzado",
        subcategory: "dama",
        audience: "dama",
        price: 32.99,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=womens+casual+sneakers"
    },
    {
        id: 14,
        name: "Organizador multiusos para hogar",
        category: "hogar",
        subcategory: "organizacion",
        audience: "todos",
        price: 15.99,
        oldPrice: 19.99,
        tag: "OFERTA",
        featured: false,
        isNew: false,
        offer: true,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=home+storage+organizer"
    },
    {
        id: 15,
        name: "Maquillaje compacto",
        category: "belleza",
        subcategory: "maquillaje",
        audience: "todos",
        price: 13.99,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=makeup+compact+set"
    },
    {
        id: 16,
        name: "Sandalias infantiles",
        category: "calzado",
        subcategory: "ninos",
        audience: "ninos",
        price: 17.99,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=kids+sandals"
    }
    ,
    {
        id: 17,
        name: "Blusa casual para dama",
        category: "ropa",
        subcategory: "dama",
        audience: "dama",
        price: 18.99,
        oldPrice: 23.99,
        tag: "OFERTA",
        featured: false,
        isNew: false,
        offer: true,
        image: "https://images.unsplash.com/photo-1564257577-1a2d4c6c3a6d?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=womens+casual+blouse"
    },
    {
        id: 18,
        name: "Pantalón casual para caballero",
        category: "ropa",
        subcategory: "caballero",
        audience: "caballero",
        price: 27.99,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=mens+casual+pants"
    },
    {
        id: 19,
        name: "Conjunto infantil cómodo",
        category: "ropa",
        subcategory: "ninos",
        audience: "ninos",
        price: 19.50,
        oldPrice: null,
        tag: "NOVEDAD",
        featured: false,
        isNew: true,
        offer: false,
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=kids+clothing+set"
    },
    {
        id: 20,
        name: "Tenis casuales para caballero",
        category: "calzado",
        subcategory: "caballero",
        audience: "caballero",
        price: 36.99,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=mens+casual+shoes"
    },
    {
        id: 21,
        name: "Tenis infantiles",
        category: "calzado",
        subcategory: "ninos",
        audience: "ninos",
        price: 24.99,
        oldPrice: 29.99,
        tag: "OFERTA",
        featured: false,
        isNew: false,
        offer: true,
        image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=kids+sneakers"
    },
    {
        id: 22,
        name: "Sandalias elegantes para dama",
        category: "calzado",
        subcategory: "dama",
        audience: "dama",
        price: 28.50,
        oldPrice: null,
        tag: "",
        featured: false,
        isNew: false,
        offer: false,
        image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=womens+sandals"
    }
    ,
    {
        id: 23, name: "Funda y accesorios para celular", category: "tecnologia",
        subcategory: "celulares", audience: "todos", price: 11.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=phone+case+accessories"
    },
    {
        id: 24, name: "Teclado compacto para computadora", category: "tecnologia",
        subcategory: "computacion", audience: "todos", price: 26.99, oldPrice: 32.99,
        tag: "OFERTA", featured: false, isNew: false, offer: true,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=compact+computer+keyboard"
    },
    {
        id: 25, name: "Tratamiento para el cuidado del cabello", category: "belleza",
        subcategory: "cabello", audience: "todos", price: 14.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=hair+care+treatment"
    },
    {
        id: 26, name: "Set de cuidado personal", category: "belleza",
        subcategory: "personal", audience: "todos", price: 17.50, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=personal+care+set"
    },
    {
        id: 27, name: "Utensilios prácticos para cocina", category: "hogar",
        subcategory: "cocina", audience: "todos", price: 15.99, oldPrice: 19.99,
        tag: "OFERTA", featured: false, isNew: false, offer: true,
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=kitchen+utensil+set"
    },
    {
        id: 28, name: "Espejo decorativo para el hogar", category: "hogar",
        subcategory: "decoracion", audience: "todos", price: 22.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=decorative+home+mirror"
    },
    {
        id: 29, name: "Lámpara LED para escritorio", category: "hogar",
        subcategory: "iluminacion", audience: "todos", price: 18.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=led+desk+lamp"
    },
    {
        id: 30, name: "Juego de mesa familiar", category: "juguetes",
        subcategory: "juguetes", audience: "ninos", price: 16.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1606503153255-59d8b8b821e2?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=family+board+game"
    },
    {
        id: 31, name: "Cuaderno y set de papelería", category: "juguetes",
        subcategory: "papeleria", audience: "ninos", price: 9.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=stationery+set"
    },
    {
        id: 32, name: "Pulsera de acero para caballero", category: "accesorios",
        subcategory: "caballero", audience: "caballero", price: 13.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=mens+steel+bracelet"
    },
    {
        id: 33, name: "Accesorio infantil para cabello", category: "accesorios",
        subcategory: "ninos", audience: "ninos", price: 7.99, oldPrice: null,
        tag: "", featured: false, isNew: false, offer: false,
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=kids+hair+accessories"
    },
    {
        id: 34, name: "Tenis para entrenamiento", category: "calzado",
        subcategory: "deportivo", audience: "caballero", price: 35.99, oldPrice: 42.99,
        tag: "OFERTA", featured: false, isNew: false, offer: true,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
        url: "https://www.amazon.com/s?k=training+sneakers"
    }
];


/* =====================================================
   UTILITIES
===================================================== */

function money(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: TROVA.currency
    }).format(value);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
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
        return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
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
    const discount = product.oldPrice && product.oldPrice > product.price
        ? `<span class="product-discount">-${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>`
        : "";
    const displayCategory = categoryNames[product.category] || product.category;

    const safeURL = safeExternalURL(product.url);

    return `
        <article class="product-card">
            <div class="product-image-wrap">
                ${tag}
                ${discount}
                <img class="product-image"
                     src="${escapeHTML(product.image)}"
                     alt="${escapeHTML(product.name)}"
                     loading="lazy">
            </div>
            <div class="product-info">
                <p class="product-category">${escapeHTML(displayCategory)} · ${escapeHTML(subcategoryNames[product.subcategory] || "")}</p>
                <h3>${escapeHTML(product.name)}</h3>
                <div class="product-price">
                    ${money(product.price)} ${oldPrice}
                </div>
                <div class="product-actions">
                    <button class="add-cart" data-add-cart="${product.id}">
                        AGREGAR AL CARRITO
                    </button>
                    <a class="product-link"
                       href="${safeURL || "#"}"
                       ${safeURL ? 'target="_blank" rel="noopener"' : ""}
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

const categoryNames = {
    tecnologia: "Tecnología",
    ropa: "Ropa y moda",
    calzado: "Calzado",
    belleza: "Belleza y cuidado personal",
    accesorios: "Accesorios",
    hogar: "Hogar y cocina",
    juguetes: "Juguetes y niños"
};

const subcategoryNames = {
    celulares: "Celulares y accesorios",
    audio: "Audio y audífonos",
    gadgets: "Gadgets",
    computacion: "Computación",
    dama: "Dama",
    caballero: "Caballero",
    ninos: "Niños",
    deportivo: "Deportivo",
    maquillaje: "Maquillaje",
    skincare: "Skincare",
    cabello: "Cuidado del cabello",
    personal: "Cuidado personal",
    joyeria: "Joyería",
    bolsos: "Bolsos y carteras",
    relojes: "Relojes y lentes",
    cocina: "Cocina",
    organizacion: "Organización",
    decoracion: "Decoración",
    iluminacion: "Iluminación",
    juguetes: "Juguetes",
    educativos: "Educativos",
    papeleria: "Papelería",
    infantil: "Accesorios infantiles"
};

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

    if (
        catalogState.subcategory &&
        ["dama", "caballero", "ninos"].includes(catalogState.subcategory)
    ) {
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
    breadcrumb.textContent = title.toUpperCase();

    description.textContent = catalogState.offers
        ? "Productos seleccionados con precios especiales. Consulta disponibilidad antes de confirmar tu pedido."
        : catalogState.category
            ? "Explora nuestra selección de " + title.toLowerCase() + "."
            : "Una selección para cada estilo y necesidad.";

    const filter = document.getElementById("audienceFilter");

    if (filter) {
        filter.style.display =
            !catalogState.offers && ["ropa", "calzado", "accesorios"].includes(catalogState.category)
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
            link.dataset.subcategory === catalogState.subcategory
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

    if (noProducts) noProducts.hidden = result.length !== 0;

    if (count) count.textContent =
        result.length + (result.length === 1 ? " producto encontrado" : " productos encontrados");

    updateCatalogHeading();
}

function initializeCatalog() {
    if (!document.getElementById("catalogProducts")) return;

    readCatalogURL();

    const search = document.getElementById("catalogSearch");
    const sort = document.getElementById("sortProducts");

    search.addEventListener("input", () => {
        catalogState.search = search.value.trim();
        renderCatalog();
    });

    sort.addEventListener("change", () => {
        catalogState.sort = sort.value;
        renderCatalog();
    });

    document.querySelectorAll("[data-category-filter]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            catalogState.category = link.dataset.category;
            catalogState.subcategory = link.dataset.subcategory;
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

            Object.assign(catalogState, {
                category: "",
                subcategory: "",
                audience: "todos",
                search: "",
                sort: "featured",
                offers: false
            });

            search.value = "";
            sort.value = "featured";

            updateCatalogURL();
            renderCatalog();
        });
    });

    document.getElementById("clearSearch").addEventListener("click", () => {
        search.value = "";
        catalogState.search = "";
        catalogState.category = "";
        catalogState.subcategory = "";
        catalogState.audience = "todos";
        catalogState.offers = false;

        updateCatalogURL();
        renderCatalog();
    });

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

        return Array.isArray(saved)
            ? saved.filter(item =>
                products.some(product => product.id === item.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            )
            : [];
    } catch {
        return [];
    }
}

let cart = loadCart();

function saveCart() {
    localStorage.setItem(TROVA.storageKey, JSON.stringify(cart));
    renderCart();
}

function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);

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
    const item = cart.find(product => product.id === id);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== id);
    }

    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
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
                <h3 style="font-family:Georgia;margin-bottom:8px">Tu carrito está vacío</h3>
                <p>Explora TROVA y agrega tus productos favoritos.</p>
            </div>
        `;
        return;
    }

    itemsContainer.innerHTML = cart.map(item => {
        const product = products.find(product => product.id === item.id);
        if (!product) return "";

        return `
            <article class="cart-item">
                <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">

                <div>
                    <h4>${escapeHTML(product.name)}</h4>
                    <p>${money(product.price)}</p>

                    <div class="cart-quantity">
                        <button data-quantity="${product.id}" data-change="-1">−</button>
                        <span>${item.quantity}</span>
                        <button data-quantity="${product.id}" data-change="1">+</button>
                    </div>
                </div>

                <button class="cart-remove" data-remove="${product.id}" aria-label="Eliminar producto">×</button>
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

    document.getElementById("checkoutButton")?.addEventListener("click", checkoutWhatsApp);

    document.addEventListener("click", event => {

        const addButton = event.target.closest("[data-add-cart]");

        if (addButton) {
            addToCart(Number(addButton.dataset.addCart));
        }

        const quantityButton = event.target.closest("[data-quantity]");

        if (quantityButton) {
            changeQuantity(
                Number(quantityButton.dataset.quantity),
                Number(quantityButton.dataset.change)
            );
        }

        const removeButton = event.target.closest("[data-remove]");

        if (removeButton) {
            removeFromCart(Number(removeButton.dataset.remove));
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

    const lines = cart.map(item => {
        const product = products.find(product => product.id === item.id);

        return product
            ? `• ${product.name}\n  Cantidad: ${item.quantity}\n  Precio referencial: ${money(product.price * item.quantity)}`
            : "";
    }).filter(Boolean);

    const message = [
        "¡Hola TROVA! Quiero realizar el siguiente pedido:",
        "",
        ...lines,
        "",
        "Subtotal referencial: " + money(cartSubtotal()),
        "",
        "Quisiera confirmar disponibilidad, precio final y detalles de entrega.",
        "",
        "Gracias."
    ].join("\n");

    window.open(
        "https://wa.me/" + TROVA.whatsapp + "?text=" + encodeURIComponent(message),
        "_blank",
        "noopener"
    );
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

        if (!name || !safeExternalURL(link)) {
            showToast("Revisa el nombre y el enlace del producto.");
            return;
        }

        const message = [
            "¡Hola TROVA! Quisiera solicitar un producto externo.",
            "",
            "Producto: " + name,
            "Enlace: " + link,
            "Detalles: " + (details || "Sin detalles adicionales."),
            "",
            "Me gustaría conocer su disponibilidad y precio."
        ].join("\n");

        window.open(
            "https://wa.me/" + TROVA.whatsapp + "?text=" + encodeURIComponent(message),
            "_blank",
            "noopener"
        );
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
        link.addEventListener("click", event => {
            const dropdown = link.closest(".nav-dropdown");

            if (link.classList.contains("nav-dropdown-trigger") &&
                window.matchMedia("(max-width: 760px)").matches) {
                event.preventDefault();
                dropdown?.classList.toggle("dropdown-open");
                return;
            }

            nav.classList.remove("mobile-open");
            nav.querySelectorAll(".nav-dropdown").forEach(item => {
                item.classList.remove("dropdown-open");
            });
        });
    });
}

function closeMobileFilters() {
    document.getElementById("catalogSidebar")?.classList.remove("mobile-open");
}

function initializeMobileFilters() {
    document.getElementById("mobileFilterToggle")?.addEventListener("click", () => {
        document.getElementById("catalogSidebar")?.classList.add("mobile-open");
    });

    document.getElementById("closeFilters")?.addEventListener("click", closeMobileFilters);
}


/* =====================================================
   INITIALIZE EVERYTHING
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    renderHomeProducts();
    initializeCatalog();
    initializeCart();
    initializeExternalRequest();
    initializeNavigation();
    initializeMobileFilters();
});
