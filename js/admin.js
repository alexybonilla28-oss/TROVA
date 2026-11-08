
/* =====================================================
   TROVA | PANEL ADMINISTRATIVO
   Supabase + Seguridad + Gestión de usuarios
===================================================== */

const db = window.trovaSupabase;

let currentUser = null;
let currentStore = null;
let currentRole = null;

let productsCache = [];
let categoriesCache = [];
let ordersCache = [];
let usersCache = [];
let promotionsCache = [];

const $ = id => document.getElementById(id);

const ADMIN_IDLE_TIMEOUT = 15 * 60 * 1000;

let adminIdleTimer = null;
let securityInitialized = false;

/* =====================================================
   UTILIDADES
===================================================== */

function showMessage(message, error = false) {
    const element = $("global-message");
    if (!element) return;

    element.textContent = message;
    element.style.display = "block";
    element.style.background = error ? "#a43e3e" : "#171717";

    clearTimeout(showMessage.timer);

    showMessage.timer = setTimeout(() => {
        element.style.display = "none";
    }, 4500);
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

    showMessage(
        context + ": " + (error?.message || "Error desconocido"),
        true
    );
}

function setButtonLoading(button, loading, normalText) {
    if (!button) return;

    button.disabled = loading;
    button.textContent = loading ? "PROCESANDO..." : normalText;
}

/* =====================================================
   INICIO
===================================================== */

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
    initializeAdminSecurity();

    const { data, error } = await db.auth.getSession();

    if (error) {
        showError("Error de sesión", error);
        return;
    }

    db.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
            clearAdminSession();
            showLogin();
        }
    });

    if (data.session) {
        await initializeAdmin(data.session.user);
    } else {
        showLogin();
    }
});

/* =====================================================
   EVENTOS
===================================================== */

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

        $("product-form-card")?.classList.remove("hidden");

        if ($("product-form-title")) {
            $("product-form-title").textContent = "Nuevo producto";
        }
    });

    $("cancel-product")?.addEventListener("click", () => {
        $("product-form-card")?.classList.add("hidden");
    });

    $("product-form")?.addEventListener("submit", saveProduct);

    $("product-search")?.addEventListener("input", renderProducts);

    $("category-form")?.addEventListener("submit", saveCategory);

    $("refresh-orders")?.addEventListener("click", loadOrders);

    $("settings-form")?.addEventListener("submit", saveSettings);

    $("products-list")?.addEventListener("click", handleProductAction);

    $("orders-list")?.addEventListener("change", handleOrderChange);

    $("user-form")?.addEventListener("submit", handleAddUser);

    $("refresh-users")?.addEventListener("click", loadUsers);

    $("users-list")?.addEventListener("click", handleUserAction);
}

/* =====================================================
   AUTENTICACIÓN
===================================================== */

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

    const email = $("email")?.value.trim();
    const password = $("password")?.value;

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

    clearAdminSession();
    showLogin();
}

function clearAdminSession() {
    clearTimeout(adminIdleTimer);

    currentUser = null;
    currentStore = null;
    currentRole = null;

    productsCache = [];
    categoriesCache = [];
    ordersCache = [];
    usersCache = [];
    promotionsCache = [];
}

/* =====================================================
   IDENTIFICAR TIENDA Y PERMISOS
===================================================== */

async function initializeAdmin(user) {

    currentUser = user;

    resetAdminIdleTimer();

    try {

        const { data: memberships, error } = await db
            .from("store_members")
            .select("store_id, role")
            .eq("user_id", user.id);

        if (error) throw error;

        if (!memberships?.length) {
            showLogin();

            showFormMessage(
                "login-error",
                "Tu usuario no está asociado a ninguna tienda.",
                true
            );

            await db.auth.signOut();
            return;
        }

        const membership = memberships[0];

        if (!["owner", "admin", "editor"].includes(membership.role)) {
            throw new Error("Tu usuario no tiene permisos administrativos.");
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

        await Promise.all([
            loadProducts(),
            loadCategories(),
            loadOrders(),
            loadPromotions()
        ]);

        if (["owner", "admin"].includes(currentRole)) {
            await loadUsers();
        }

        await loadSettings();

        navigate("dashboard");

        updateUserPermissions();

    } catch (error) {
        showError("Error al identificar tu tienda", error);
    }
}

/* =====================================================
   PERMISOS VISUALES
===================================================== */

function updateUserPermissions() {

    const canManageUsers = ["owner", "admin"].includes(currentRole);

    const usersButton = document.querySelector(
        '[data-section="users"]'
    );

    if (usersButton) {
        usersButton.style.display = canManageUsers ? "" : "none";
    }

    const addButton = $("add-user-button");

    if (addButton) {
        addButton.disabled = !canManageUsers;
    }

    const userForm = $("user-form");

    if (userForm && !canManageUsers) {
        userForm.style.display = "none";
    }

    const securityText = $("section-users")?.querySelector(
        ".panel-card:last-child"
    );

    if (securityText && currentRole === "admin") {
        securityText.querySelector("h2").textContent =
            "Permisos de administrador";
    }
}

/* =====================================================
   SEGURIDAD: INACTIVIDAD
===================================================== */

function resetAdminIdleTimer() {

    if (!currentUser) return;

    clearTimeout(adminIdleTimer);

    adminIdleTimer = setTimeout(async () => {

        if (!currentUser) return;

        showMessage(
            "Sesión cerrada por 15 minutos de inactividad.",
            true
        );

        await db.auth.signOut();

        clearAdminSession();
        showLogin();

        showFormMessage(
            "login-error",
            "Tu sesión expiró por inactividad. Ingresa nuevamente."
        );

    }, ADMIN_IDLE_TIMEOUT);
}

function initializeAdminSecurity() {

    if (securityInitialized) return;

    securityInitialized = true;

    [
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "click"
    ].forEach(eventName => {

        document.addEventListener(
            eventName,
            resetAdminIdleTimer,
            { passive: true }
        );

    });

    document.addEventListener("visibilitychange", () => {

        if (!document.hidden && currentUser) {
            resetAdminIdleTimer();
        }

    });

    console.log("TROVA: seguridad activada.");
}

/* =====================================================
   NAVEGACIÓN
===================================================== */

function navigate(section) {

    if (section === "users" &&
        !["owner", "admin"].includes(currentRole)) {
        showMessage("No tienes permiso para administrar usuarios.", true);
        return;
    }

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

/* =====================================================
   PRODUCTOS
===================================================== */

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
        (product.name || "").toLowerCase().includes(search)
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
                                    data-id="${escapeHTML(product.id)}">
                                    Editar
                                </button>
                                <button class="action-button action-delete"
                                    data-action="delete"
                                    data-id="${escapeHTML(product.id)}">
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

    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

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

    const button = $("product-form").querySelector(
        'button[type="submit"]'
    );

    if (!name) return;

    setButtonLoading(button, true, "GUARDAR PRODUCTO");

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

        resetProductForm();

        $("product-form-card").classList.add("hidden");

        await loadProducts();

        showMessage(
            id
                ? "Producto actualizado correctamente."
                : "Producto creado correctamente."
        );

    } catch (error) {

        showFormMessage("product-message", error.message, true);

    } finally {

        setButtonLoading(button, false, "GUARDAR PRODUCTO");

    }
}

function resetProductForm() {

    $("product-form")?.reset();

    if ($("product-id")) $("product-id").value = "";

    if ($("product-active")) {
        $("product-active").checked = true;
    }

    if ($("product-form-title")) {
        $("product-form-title").textContent = "Nuevo producto";
    }

    showFormMessage("product-message", "");
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

    if (button.dataset.action === "edit") {
        editProduct(button.dataset.id);
    }

    if (button.dataset.action === "delete") {
        deleteProduct(button.dataset.id);
    }
}

/* =====================================================
   CATEGORÍAS Y SUBCATEGORÍAS
===================================================== */

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
                <option value="${escapeHTML(category.id)}">
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
                    <option value="${escapeHTML(category.id)}">
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

    if (!name || !currentStore) return;

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

/* =====================================================
   PEDIDOS
===================================================== */

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
                        <td>#${escapeHTML(
                            order.order_number || order.id.slice(0, 8)
                        )}</td>

                        <td>${escapeHTML(order.customer_name)}</td>

                        <td>${escapeHTML(order.customer_phone)}</td>

                        <td>${formatMoney(order.estimated_total)}</td>

                        <td>${formatDate(order.created_at)}</td>

                        <td>
                            <select class="status-select"
                                data-order-id="${escapeHTML(order.id)}">

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
                        <td>#${escapeHTML(
                            order.order_number || order.id.slice(0, 8)
                        )}</td>
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

    const previous = ordersCache.find(
        order => order.id === select.dataset.orderId
    );

    const oldStatus = previous?.status;

    const { error } = await db
        .from("orders")
        .update({
            status: select.value,
            updated_at: new Date().toISOString()
        })
        .eq("id", select.dataset.orderId)
        .eq("store_id", currentStore);

    if (error) {

        showError("No se pudo actualizar el pedido", error);

        if (oldStatus) select.value = oldStatus;

        return;
    }

    showMessage("Estado del pedido actualizado.");

    await loadOrders();
}

/* =====================================================
   PROMOCIONES
===================================================== */

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

    promotionsCache = data || [];

    renderPromotions();
}

function renderPromotions() {

    const panel = $("section-promotions")?.querySelector(".panel-card");

    if (!panel) return;

    if (!promotionsCache.length) {

        panel.innerHTML = `
            <h2>Promociones de TROVA</h2>
            <p class="muted">
                Todavía no hay promociones registradas.
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
                    ${promotionsCache.map(item => `
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

/* =====================================================
   USUARIOS | CONEXIÓN SEGURA
===================================================== */

/*
  IMPORTANTE:
  La función manage-store-users debe crearse en Supabase.
  Nunca se utiliza service_role desde este archivo.
*/

async function manageStoreUser(action, payload = {}) {

    if (!currentUser || !currentStore) {
        throw new Error("No hay una sesión administrativa activa.");
    }

    if (!["owner", "admin"].includes(currentRole)) {
        throw new Error(
            "No tienes permisos para gestionar usuarios."
        );
    }

    const { data, error } = await db.functions.invoke(
        "manage-store-users",
        {
            body: {
                action,
                store_id: currentStore,
                ...payload
            }
        }
    );

    if (error) {

        let detail = error.message;

        try {
            const response = error.context;

            if (response?.json) {
                const body = await response.json();
                detail = body.error || body.message || detail;
            }

        } catch (_) {}

        throw new Error(detail);
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data;
}

/* AGREGAR USUARIO */

async function addStoreUser(email, role) {

    email = String(email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Introduce un correo electrónico válido.");
    }

    if (!["admin", "editor"].includes(role)) {
        throw new Error("El rol seleccionado no es válido.");
    }

    return manageStoreUser("create", {
        email,
        role
    });
}

async function handleAddUser(event) {

    event.preventDefault();

    const email = $("user-email").value.trim();
    const role = $("user-role").value;
    const button = $("add-user-button");

    showFormMessage("user-message", "");

    setButtonLoading(button, true, "AGREGAR USUARIO");

    try {

        const result = await addStoreUser(email, role);

        $("user-form").reset();

        showFormMessage(
            "user-message",
            result?.message ||
            "Usuario agregado correctamente. Revisa el correo de invitación."
        );

        await loadUsers();

    } catch (error) {

        console.error("TROVA usuarios:", error);

        showFormMessage(
            "user-message",
            error.message,
            true
        );

    } finally {

        setButtonLoading(button, false, "AGREGAR USUARIO");

    }
}

/* LISTAR USUARIOS */

async function loadUsers() {

    if (!currentStore) return;

    const container = $("users-list");

    if (!container) return;

    if (!["owner", "admin"].includes(currentRole)) {
        container.innerHTML =
            '<p class="muted">No tienes permisos para ver los miembros.</p>';
        return;
    }

    container.innerHTML =
        '<p class="muted">Cargando miembros...</p>';

    try {

        const result = await manageStoreUser("list");

        usersCache = result?.members || [];

        renderUsers();

    } catch (error) {

        console.error("TROVA usuarios:", error);

        container.innerHTML = `
            <p class="error-message">
                No se pudieron cargar los usuarios:
                ${escapeHTML(error.message)}
            </p>
        `;

    }
}

/* DIBUJAR USUARIOS */

function renderUsers() {

    const container = $("users-list");

    if (!container) return;

    if (!usersCache.length) {

        container.innerHTML = `
            <p class="muted">
                Todavía no hay miembros registrados.
            </p>
        `;

        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>USUARIO</th>
                    <th>ROL</th>
                    <th>ACCESO</th>
                    <th>ACCIONES</th>
                </tr>
            </thead>

            <tbody>
                ${usersCache.map(user => {

                    const userId = user.user_id || user.id;

                    const isCurrentUser = userId === currentUser?.id;

                    const roleName = {
                        owner: "Propietario",
                        admin: "Administrador",
                        editor: "Editor"
                    }[user.role] || user.role;

                    return `
                        <tr>
                            <td>
                                ${escapeHTML(
                                    user.email ||
                                    user.profile?.email ||
                                    userId
                                )}
                            </td>

                            <td>${escapeHTML(roleName)}</td>

                            <td>
                                ${user.is_active === false
                                    ? "Inactivo"
                                    : "Activo"}
                            </td>

                            <td>
                                ${user.role !== "owner" && !isCurrentUser
                                    ? `
                                        <button
                                            class="action-button action-delete"
                                            data-user-action="remove"
                                            data-user-id="${escapeHTML(userId)}"
                                        >
                                            Quitar acceso
                                        </button>
                                    `
                                    : '<span class="muted">Protegido</span>'}
                            </td>
                        </tr>
                    `;

                }).join("")}
            </tbody>
        </table>
    `;
}

/* QUITAR USUARIO */

async function removeStoreUser(userId) {

    if (!userId) {
        throw new Error("No se identificó el usuario.");
    }

    if (userId === currentUser?.id) {
        throw new Error("No puedes quitarte tu propio acceso.");
    }

    const user = usersCache.find(
        item => (item.user_id || item.id) === userId
    );

    if (user?.role === "owner") {
        throw new Error("No puedes eliminar al propietario.");
    }

    if (!confirm(
        "¿Seguro que deseas quitar este usuario de TROVA?"
    )) {
        return false;
    }

    return manageStoreUser("remove", {
        user_id: userId
    });
}

async function handleUserAction(event) {

    const button = event.target.closest("[data-user-action]");

    if (!button) return;

    if (button.dataset.userAction !== "remove") return;

    const userId = button.dataset.userId;

    button.disabled = true;

    try {

        const result = await removeStoreUser(userId);

        if (result === false) {
            button.disabled = false;
            return;
        }

        showMessage(
            result?.message || "Acceso del usuario eliminado."
        );

        await loadUsers();

    } catch (error) {

        showError("No se pudo quitar el usuario", error);

        button.disabled = false;

    }
}

/* =====================================================
   CONFIGURACIÓN DE LA TIENDA
===================================================== */

/*
  Este apartado utiliza los campos:
  store_id, whatsapp, primary_color, secondary_color.
  Si tu tabla tiene nombres diferentes habrá que adaptarlos.
*/

async function loadSettings() {

    if (!currentStore) return;

    const { data, error } = await db
        .from("store_settings")
        .select("*")
        .eq("store_id", currentStore)
        .maybeSingle();

    if (error) {
        showError("Error cargando configuración", error);
        return;
    }

    if (!data) return;

    if ($("settings-whatsapp")) {
        $("settings-whatsapp").value = data.whatsapp || "";
    }

    if ($("settings-primary")) {
        $("settings-primary").value =
            data.primary_color || "#171717";
    }

    if ($("settings-secondary")) {
        $("settings-secondary").value =
            data.secondary_color || "#c6a15b";
    }
}

async function saveSettings(event) {

    event.preventDefault();

    if (!currentStore) return;

    const payload = {
        store_id: currentStore,
        whatsapp: $("settings-whatsapp").value.trim(),
        primary_color: $("settings-primary").value,
        secondary_color: $("settings-secondary").value
    };

    const { error } = await db
        .from("store_settings")
        .upsert(payload, {
            onConflict: "store_id"
        });

    if (error) {
        showFormMessage("settings-message", error.message, true);
        return;
    }

    showFormMessage(
        "settings-message",
        "Configuración guardada correctamente."
    );

    showMessage("Configuración de TROVA actualizada.");
}

/* =====================================================
   RESUMEN GENERAL
===================================================== */

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

/* =====================================================
   FIN DEL PANEL TROVA
===================================================== */

console.log("TROVA: panel administrativo preparado.");
