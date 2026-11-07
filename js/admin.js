
/* =====================================================
   TROVA | PANEL ADMINISTRATIVO
   Conexión con Supabase
   ===================================================== */

const db = window.trovaSupabase;

let currentUser = null;
let currentStore = null;
let currentRole = null;
let productsCache = [];
let categoriesCache = [];
let ordersCache = [];

/* ELEMENTOS */

const $ = (id) => document.getElementById(id);

function showMessage(message, error = false) {
    const element = $("global-message");
    if (!element) return;

    element.textContent = message;
    element.style.display = "block";
    element.style.background = error ? "#a43e3e" : "#171717";

    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(() => {
        element.style.display = "none";
    }, 4000);
}

function showFormMessage(id, message, error = false) {
    const element = $(id);
    if (!element) return;

    element.textContent = message;
    element.style.color = error ? "#b94a48" : "#32845b";
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function formatMoney(value) {
    return new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD"
    }).format(Number(value) || 0);
}

function formatDate(value) {
    if (!value) return "Sin fecha";

    return new Date(value).toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function makeSlug(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function showError(context, error) {
    console.error("TROVA:", context, error);

    const message = error?.message || "Error desconocido";
    showMessage(context + ": " + message, true);
}

/* INICIO */

document.addEventListener("DOMContentLoaded", async () => {
    if (!db) {
        showFormMessage(
            "login-error",
            "No se pudo conectar con Supabase. Revisa supabase.js.",
            true
        );
        return;
    }

    bindEvents();

    const { data, error } = await db.auth.getSession();

    if (error) {
        showError("Error de sesión", error);
        return;
    }

    if (data.session) {
        await initializeAdmin(data.session.user);
    } else {
        showLogin();
    }

    db.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
            currentUser = null;
            currentStore = null;
            showLogin();
        }
    });
});

/* EVENTOS */

function bindEvents() {
    $("login-form")?.addEventListener("submit", login);
    $("logout-button")?.addEventListener("click", logout);

    document.querySelectorAll("[data-section]").forEach(button => {
        button.addEventListener("click", () => {
            navigate(button.dataset.section);
        });
    });

    document.querySelectorAll("[data-go]").forEach(button => {
        button.addEventListener("click", () => {
            navigate(button.dataset.go);
        });
    });

    $("new-product-button")?.addEventListener("click", () => {
        resetProductForm();
        $("product-form-card").classList.remove("hidden");
        $("product-form-title").textContent = "Nuevo producto";
    });

    $("cancel-product")?.addEventListener("click", () => {
        $("product-form-card").classList.add("hidden");
    });

    $("product-form")?.addEventListener("submit", saveProduct);
    $("product-search")?.addEventListener("input", renderProducts);

    $("category-form")?.addEventListener("submit", saveCategory);
    $("refresh-orders")?.addEventListener("click", loadOrders);

    $("settings-form")?.addEventListener("submit", event => {
        event.preventDefault();
        showMessage(
            "La configuración comercial se conectará cuando creemos store_settings."
        );
    });

    $("products-list")?.addEventListener("click", handleProductAction);
    $("orders-list")?.addEventListener("change", handleOrderChange);
}

/* AUTENTICACIÓN */

function showLogin() {
    $("login-screen")?.classList.remove("hidden");
    $("admin-app")?.classList.add("hidden");
}

function showAdmin() {
    $("login-screen")?.classList.add("hidden");
    $("admin-app")?.classList.remove("hidden");
}

async function login(event) {
    event.preventDefault();

    const email = $("email").value.trim();
    const password = $("password").value;

    showFormMessage("login-error", "Verificando acceso...");

    const { data, error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showFormMessage(
            "login-error",
            "No se pudo iniciar sesión: " + error.message,
            true
        );
        return;
    }

    await initializeAdmin(data.user);
}

async function logout() {
    const { error } = await db.auth.signOut();

    if (error) {
        showError("No se pudo cerrar sesión", error);
        return;
    }

    showLogin();
}

/* IDENTIFICAR TIENDA Y PERMISOS */

async function initializeAdmin(user) {
    currentUser = user;

    try {
        const { data: memberships, error } = await db
            .from("store_members")
            .select("store_id, role")
            .eq("user_id", user.id);

        if (error) throw error;

        if (!memberships || memberships.length === 0) {
            showLogin();
            showFormMessage(
                "login-error",
                "Tu usuario no está asociado a ninguna tienda. Debes registrarlo como miembro de TROVA.",
                true
            );
            await db.auth.signOut();
            return;
        }

        const membership = memberships[0];

        if (!["owner", "admin", "editor"].includes(membership.role)) {
            showLogin();
            showFormMessage(
                "login-error",
                "Tu usuario no tiene permisos para administrar esta tienda.",
                true
            );
            await db.auth.signOut();
            return;
        }

        currentStore = membership.store_id;
        currentRole = membership.role;

        const { data: store, error: storeError } = await db
            .from("stores")
            .select("id, name, slug, status")
            .eq("id", currentStore)
            .single();

        if (storeError) throw storeError;

        if (store.status && store.status !== "active") {
            throw new Error("La tienda no está activa.");
        }

        $("store-name").textContent = store.name || "TROVA";
        $("admin-email").textContent = user.email || "Administrador";

        showAdmin();

        await loadDashboard();
        await loadCategories();
        await loadProducts();
        await loadOrders();
        await loadPromotions();

        navigate("dashboard");

    } catch (error) {
        showError("Error al identificar tu tienda", error);
    }
}

/* NAVEGACIÓN */

function navigate(section) {
    document.querySelectorAll(".admin-section").forEach(element => {
        element.classList.add("hidden");
    });

    const selected = $("section-" + section);

    if (selected) {
        selected.classList.remove("hidden");
    }

    document.querySelectorAll("[data-section]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === section
        );
    });
}

/* PRODUCTOS */

async function loadProducts() {
    if (!currentStore) return;

    const { data, error } = await db
        .from("products")
        .select("*")
        .eq("store_id", currentStore)
        .order("created_at", { ascending: false });

    if (error) {
        showError("Error cargando productos", error);
        return;
    }

    productsCache = data || [];
    renderProducts();
    updateDashboardStats();
}

function renderProducts() {
    const container = $("products-list");
    if (!container) return;

    const search = ($("product-search")?.value || "").toLowerCase();

    const filtered = productsCache.filter(product =>
        product.name.toLowerCase().includes(search)
    );

    if (!filtered.length) {
        container.innerHTML =
            '<p class="muted">No hay productos registrados todavía.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>IMAGEN</th>
                    <th>PRODUCTO</th>
                    <th>PRECIO</th>
                    <th>EXISTENCIAS</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(product => `
                    <tr>
                        <td>
                            ${product.image_url
                                ? `<img class="table-image"
                                    src="${escapeHTML(product.image_url)}"
                                    alt="">`
                                : "—"}
                        </td>
                        <td>${escapeHTML(product.name)}</td>
                        <td>${formatMoney(product.price)}</td>
                        <td>${Number(product.stock) || 0}</td>
                        <td>${product.is_active ? "Visible" : "Oculto"}</td>
                        <td>
                            <div class="table-actions">
                                <button class="action-button"
                                    data-action="edit"
                                    data-id="${product.id}">
                                    Editar
                                </button>
                                <button class="action-button action-delete"
                                    data-action="delete"
                                    data-id="${product.id}">
                                    Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

async function uploadProductImage(file) {
    if (!file) return null;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
        throw new Error("Utiliza una imagen JPG, PNG o WEBP.");
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no puede superar los 5 MB.");
    }

    const extension = file.name.split(".").pop().toLowerCase();
    const path = `${currentStore}/${crypto.randomUUID()}.${extension}`;

    const { error } = await db.storage
        .from("product-images")
        .upload(path, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) throw error;

    const { data } = db.storage
        .from("product-images")
        .getPublicUrl(path);

    return data.publicUrl;
}

async function saveProduct(event) {
    event.preventDefault();

    if (!currentStore) return;

    const id = $("product-id").value;
    const name = $("product-name").value.trim();
    const file = $("product-image").files[0];

    if (!name) return;

    const button = $("product-form").querySelector(
        'button[type="submit"]'
    );

    button.disabled = true;
    button.textContent = "GUARDANDO...";

    try {
        let imageUrl = null;

        if (file) {
            imageUrl = await uploadProductImage(file);
        }

        const payload = {
            store_id: currentStore,
            name,
            slug: makeSlug(name),
            description: $("product-description").value.trim(),
            price: Number($("product-price").value),
            compare_price: $("product-compare-price").value
                ? Number($("product-compare-price").value)
                : null,
            stock: Number($("product-stock").value) || 0,
            category_id: $("product-category").value || null,
            external_url: $("product-external-url").value.trim() || null,
            is_featured: $("product-featured").checked,
            is_offer: $("product-offer").checked,
            is_active: $("product-active").checked
        };

        if (imageUrl) {
            payload.image_url = imageUrl;
        }

        let result;

        if (id) {
            result = await db
                .from("products")
                .update(payload)
                .eq("id", id)
                .eq("store_id", currentStore);
        } else {
            result = await db
                .from("products")
                .insert(payload);
        }

        if (result.error) throw result.error;

        showFormMessage(
            "product-message",
            id ? "Producto actualizado correctamente." :
                "Producto creado correctamente."
        );

        resetProductForm();
        $("product-form-card").classList.add("hidden");

        await loadProducts();
        showMessage("Producto guardado correctamente.");

    } catch (error) {
        showFormMessage(
            "product-message",
            error.message,
            true
        );
    } finally {
        button.disabled = false;
        button.textContent = "GUARDAR PRODUCTO";
    }
}

function resetProductForm() {
    $("product-form").reset();
    $("product-id").value = "";
    $("product-active").checked = true;
    $("product-form-title").textContent = "Nuevo producto";
}

function editProduct(id) {
    const product = productsCache.find(item => item.id === id);
    if (!product) return;

    $("product-id").value = product.id;
    $("product-name").value = product.name || "";
    $("product-price").value = product.price ?? "";
    $("product-compare-price").value = product.compare_price ?? "";
    $("product-stock").value = product.stock ?? 0;
    $("product-category").value = product.category_id || "";
    $("product-description").value = product.description || "";
    $("product-external-url").value = product.external_url || "";
    $("product-featured").checked = !!product.is_featured;
    $("product-offer").checked = !!product.is_offer;
    $("product-active").checked = !!product.is_active;

    $("product-image").value = "";
    $("product-form-title").textContent = "Editar producto";
    $("product-form-card").classList.remove("hidden");

    $("product-form-card").scrollIntoView({
        behavior: "smooth"
    });
}

async function deleteProduct(id) {
    const product = productsCache.find(item => item.id === id);
    if (!product) return;

    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    const { error } = await db
        .from("products")
        .delete()
        .eq("id", id)
        .eq("store_id", currentStore);

    if (error) {
        showError("No se pudo eliminar el producto", error);
        return;
    }

    showMessage("Producto eliminado.");
    await loadProducts();
}

function handleProductAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        editProduct(id);
    }

    if (button.dataset.action === "delete") {
        deleteProduct(id);
    }
}

/* CATEGORÍAS Y SUBCATEGORÍAS */

async function loadCategories() {
    if (!currentStore) return;

    const { data, error } = await db
        .from("categories")
        .select("*")
        .eq("store_id", currentStore)
        .order("position", { ascending: true });

    if (error) {
        showError("Error cargando categorías", error);
        return;
    }

    categoriesCache = data || [];

    renderCategories();
    populateCategorySelects();
    updateDashboardStats();
}

function populateCategorySelects() {
    const productSelect = $("product-category");
    const parentSelect = $("category-parent");

    if (productSelect) {
        productSelect.innerHTML =
            '<option value="">Sin categoría</option>' +
            categoriesCache.map(category => `
                <option value="${category.id}">
                    ${category.parent_id ? "— " : ""}
                    ${escapeHTML(category.name)}
                </option>
            `).join("");
    }

    if (parentSelect) {
        parentSelect.innerHTML =
            '<option value="">Categoría principal nueva</option>' +
            categoriesCache
                .filter(category => !category.parent_id)
                .map(category => `
                    <option value="${category.id}">
                        ${escapeHTML(category.name)}
                    </option>
                `).join("");
    }
}

function renderCategories() {
    const container = $("categories-list");
    if (!container) return;

    if (!categoriesCache.length) {
        container.innerHTML =
            '<p class="muted">Todavía no hay categorías.</p>';
        return;
    }

    const parents = categoriesCache.filter(item => !item.parent_id);

    container.innerHTML = parents.map(parent => {
        const children = categoriesCache.filter(
            item => item.parent_id === parent.id
        );

        return `
            <div style="padding:15px 0;border-bottom:1px solid #eee">
                <strong>${escapeHTML(parent.name)}</strong>
                ${children.length
                    ? `<ul style="padding:12px 25px">
                        ${children.map(child => `
                            <li>${escapeHTML(child.name)}</li>
                        `).join("")}
                    </ul>`
                    : '<p class="muted">Sin subcategorías</p>'}
            </div>
        `;
    }).join("");
}

async function saveCategory(event) {
    event.preventDefault();

    const name = $("category-name").value.trim();
    const parentId = $("category-parent").value || null;

    if (!name) return;

    const payload = {
        store_id: currentStore,
        name,
        slug: makeSlug(name),
        parent_id: parentId,
        is_active: true,
        position: categoriesCache.length
    };

    const { error } = await db
        .from("categories")
        .insert(payload);

    if (error) {
        showFormMessage("category-message", error.message, true);
        return;
    }

    $("category-form").reset();

    showFormMessage(
        "category-message",
        "Categoría guardada correctamente."
    );

    await loadCategories();
}

/* PEDIDOS */

async function loadOrders() {
    if (!currentStore) return;

    const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("store_id", currentStore)
        .order("created_at", { ascending: false });

    if (error) {
        showError("Error cargando pedidos", error);
        return;
    }

    ordersCache = data || [];
    renderOrders();
    renderRecentOrders();
    updateDashboardStats();
}

function renderOrders() {
    const container = $("orders-list");
    if (!container) return;

    if (!ordersCache.length) {
        container.innerHTML =
            '<p class="muted">Todavía no hay pedidos registrados.</p>';
        return;
    }

    const statuses = [
        "pending",
        "confirmed",
        "processing",
        "delivered",
        "cancelled"
    ];

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>PEDIDO</th>
                    <th>CLIENTE</th>
                    <th>TELÉFONO</th>
                    <th>TOTAL</th>
                    <th>FECHA</th>
                    <th>ESTADO</th>
                </tr>
            </thead>
            <tbody>
                ${ordersCache.map(order => `
                    <tr>
                        <td>#${escapeHTML(order.order_number || order.id.slice(0, 8))}</td>
                        <td>${escapeHTML(order.customer_name)}</td>
                        <td>${escapeHTML(order.customer_phone)}</td>
                        <td>${formatMoney(order.estimated_total)}</td>
                        <td>${formatDate(order.created_at)}</td>
                        <td>
                            <select class="status-select"
                                data-order-id="${order.id}">
                                ${statuses.map(status => `
                                    <option value="${status}"
                                        ${order.status === status ? "selected" : ""}>
                                        ${status}
                                    </option>
                                `).join("")}
                            </select>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function renderRecentOrders() {
    const container = $("recent-orders");
    if (!container) return;

    const recent = ordersCache.slice(0, 5);

    if (!recent.length) {
        container.innerHTML =
            '<p class="muted">No hay pedidos recientes.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>PEDIDO</th>
                    <th>CLIENTE</th>
                    <th>TOTAL</th>
                    <th>ESTADO</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(order => `
                    <tr>
                        <td>#${escapeHTML(order.order_number || order.id.slice(0, 8))}</td>
                        <td>${escapeHTML(order.customer_name)}</td>
                        <td>${formatMoney(order.estimated_total)}</td>
                        <td>${escapeHTML(order.status || "pending")}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

async function handleOrderChange(event) {
    const select = event.target.closest("[data-order-id]");
    if (!select) return;

    const id = select.dataset.orderId;

    const { error } = await db
        .from("orders")
        .update({
            status: select.value,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("store_id", currentStore);

    if (error) {
        showError("No se pudo actualizar el pedido", error);
        return;
    }

    showMessage("Estado del pedido actualizado.");
    await loadOrders();
}

/* PROMOCIONES */

async function loadPromotions() {
    if (!currentStore) return;

    const { data, error } = await db
        .from("promotions")
        .select("*")
        .eq("store_id", currentStore)
        .order("created_at", { ascending: false });

    if (error) {
        showError("Error cargando promociones", error);
        return;
    }

    const section = $("section-promotions");
    const panel = section?.querySelector(".panel-card");

    if (!panel) return;

    if (!data || !data.length) {
        panel.innerHTML = `
            <h2>Promociones de TROVA</h2>
            <p class="muted">
                Todavía no hay promociones registradas.
                La administración de campañas se habilitará en la siguiente etapa.
            </p>
        `;
        return;
    }

    panel.innerHTML = `
        <h2>Promociones registradas</h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>PROMOCIÓN</th>
                        <th>DESCUENTO</th>
                        <th>INICIO</th>
                        <th>FINALIZA</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>${escapeHTML(item.title)}</td>
                            <td>${Number(item.discount_percent) || 0}%</td>
                            <td>${formatDate(item.start_at)}</td>
                            <td>${formatDate(item.end_at)}</td>
                            <td>${item.is_active ? "Activa" : "Inactiva"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* RESUMEN */

async function loadDashboard() {
    await Promise.all([
        loadProducts(),
        loadCategories(),
        loadOrders()
    ]);
}

function updateDashboardStats() {
    if ($("stat-products")) {
        $("stat-products").textContent = productsCache.length;
    }

    if ($("stat-orders")) {
        $("stat-orders").textContent = ordersCache.length;
    }

    if ($("stat-pending")) {
        $("stat-pending").textContent =
            ordersCache.filter(order =>
                order.status === "pending"
            ).length;
    }

    if ($("stat-categories")) {
        $("stat-categories").textContent = categoriesCache.length;
    }
}

/* FIN DEL PANEL TROVA */
