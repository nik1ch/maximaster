const API_BASE_URL = getApiBaseUrl();
const CATEGORY_PREVIEWS = {
  "Пейзажи": "preview-green",
  "Портреты": "preview-gold",
  "Натюрморты": "preview-rose",
  "Морские виды": "preview-sea"
};
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

let paintings = [];

function getApiBaseUrl() {
  const localFrontendPorts = ["8080", "5500", "5173"];

  if (window.location.protocol === "file:" || localFrontendPorts.includes(window.location.port)) {
    return "http://localhost:5000/api/paintings";
  }

  return `${window.location.origin}/api/paintings`;
}

function getPaintingId() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "error" in data
      ? data.error
      : "Не удалось выполнить запрос.";

    throw new Error(message);
  }

  return data;
}

async function loadPaintings() {
  paintings = await requestJson(API_BASE_URL);
  return paintings;
}

async function loadPainting(id) {
  return requestJson(`${API_BASE_URL}/${id}`);
}

function getFormValue(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Можно загрузить только изображение."));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error("Размер изображения не должен превышать 2 МБ."));
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Не удалось прочитать файл изображения.")));
    reader.readAsDataURL(file);
  });
}

function renderPaintingPreview(painting, sizeClass = "") {
  const imageUrl = painting.imageUrl?.trim();
  const previewClass = painting.previewClass || "preview-blue";
  const className = `painting-preview ${sizeClass} ${previewClass}`.trim();

  if (!imageUrl) {
    return `<div class="${escapeHtml(className)}"></div>`;
  }

  return `
    <div class="${escapeHtml(className)}">
      <img class="painting-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(painting.title)}">
    </div>
  `;
}

async function getFormPayload(form, currentPainting = null) {
  const formData = new FormData(form);
  const category = getFormValue(formData, "category");
  const imageFile = form.elements.imageFile?.files[0];
  const uploadedImageUrl = await readImageFile(imageFile);
  const imageUrl = uploadedImageUrl || getFormValue(formData, "imageUrl") || currentPainting?.imageUrl || "";

  return {
    title: getFormValue(formData, "title"),
    artist: getFormValue(formData, "artist"),
    year: Number(getFormValue(formData, "year")),
    category,
    description: getFormValue(formData, "description"),
    previewClass: currentPainting?.category === category
      ? currentPainting.previewClass
      : CATEGORY_PREVIEWS[category] || "preview-blue",
    imageUrl
  };
}

function setPageMessage(container, text, type = "info") {
  container.innerHTML = `<p class="empty-state ${type}">${escapeHtml(text)}</p>`;
}

function renderCatalog(category = "Все") {
  const catalogList = document.querySelector("[data-catalog-list]");

  if (!catalogList) {
    return;
  }

  const filteredPaintings = category === "Все"
    ? paintings
    : paintings.filter((painting) => painting.category === category);

  if (filteredPaintings.length === 0) {
    setPageMessage(catalogList, "В этой категории пока нет картин.");
    return;
  }

  catalogList.innerHTML = filteredPaintings.map((painting) => `
    <article class="painting-card">
      ${renderPaintingPreview(painting)}
      <div class="painting-info">
        <h3>${escapeHtml(painting.title)}</h3>
        <p>${escapeHtml(painting.artist)}, ${escapeHtml(painting.year)}</p>
        <div class="painting-meta">
          <span class="tag">${escapeHtml(painting.category)}</span>
        </div>
        <div class="actions">
          <a href="details.html?id=${painting.id}">Подробнее</a>
        </div>
      </div>
    </article>
  `).join("");
}

async function initCatalogPage() {
  const catalogList = document.querySelector("[data-catalog-list]");

  if (!catalogList) {
    return;
  }

  setPageMessage(catalogList, "Загрузка каталога...");

  try {
    await loadPaintings();
    renderCatalog();
  } catch (error) {
    setPageMessage(catalogList, error.message, "error");
  }
}

async function initDetailsPage() {
  const details = document.querySelector("[data-details]");

  if (!details) {
    return;
  }

  const title = document.querySelector("[data-details-title]");
  const id = getPaintingId();

  if (!id) {
    title.textContent = "Картина не найдена";
    setPageMessage(details, "В адресе страницы не указан идентификатор картины.", "error");
    return;
  }

  setPageMessage(details, "Загрузка картины...");

  try {
    const painting = await loadPainting(id);

    document.title = painting.title;
    title.textContent = painting.title;

    details.innerHTML = `
      ${renderPaintingPreview(painting, "large")}
      <dl>
        <div>
          <dt>Автор</dt>
          <dd>${escapeHtml(painting.artist)}</dd>
        </div>
        <div>
          <dt>Год</dt>
          <dd>${escapeHtml(painting.year)}</dd>
        </div>
        <div>
          <dt>Категория</dt>
          <dd>${escapeHtml(painting.category)}</dd>
        </div>
        <div>
          <dt>Описание</dt>
          <dd>${escapeHtml(painting.description)}</dd>
        </div>
      </dl>
      <div class="form-actions">
        <a class="button secondary" href="index.html">Назад</a>
      </div>
    `;
  } catch (error) {
    title.textContent = "Картина не найдена";
    setPageMessage(details, error.message, "error");
  }
}

function renderAdminList() {
  const adminList = document.querySelector("[data-admin-list]");

  if (!adminList) {
    return;
  }

  if (paintings.length === 0) {
    adminList.innerHTML = '<tr><td colspan="6">В каталоге пока нет картин.</td></tr>';
    return;
  }

  adminList.innerHTML = paintings.map((painting) => `
    <tr>
      <td>${renderAdminImage(painting)}</td>
      <td>${escapeHtml(painting.title)}</td>
      <td>${escapeHtml(painting.artist)}</td>
      <td>${escapeHtml(painting.year)}</td>
      <td>${escapeHtml(painting.category)}</td>
      <td class="actions">
        <a href="../details.html?id=${painting.id}">Просмотр</a>
        <a href="edit.html?id=${painting.id}">Изменить</a>
        <button type="button" data-action="delete" data-id="${painting.id}">Удалить</button>
      </td>
    </tr>
  `).join("");
}

async function initAdminPage() {
  const adminList = document.querySelector("[data-admin-list]");

  if (!adminList) {
    return;
  }

  adminList.innerHTML = '<tr><td colspan="6">Загрузка записей...</td></tr>';

  try {
    await loadPaintings();
    renderAdminList();
  } catch (error) {
    adminList.innerHTML = `<tr><td colspan="6">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderAdminImage(painting) {
  if (!painting.imageUrl) {
    return `<span class="admin-thumb ${escapeHtml(painting.previewClass || "preview-blue")}"></span>`;
  }

  return `
    <span class="admin-thumb">
      <img src="${escapeHtml(painting.imageUrl)}" alt="${escapeHtml(painting.title)}">
    </span>
  `;
}

async function initEditForm() {
  const editForm = document.querySelector("[data-edit-form]");

  if (!editForm) {
    return null;
  }

  const id = getPaintingId();

  if (!id) {
    alert("В адресе страницы не указан идентификатор картины.");
    window.location.href = "index.html";
    return null;
  }

  try {
    const painting = await loadPainting(id);

    editForm.elements.title.value = painting.title;
    editForm.elements.artist.value = painting.artist;
    editForm.elements.year.value = painting.year;
    editForm.elements.category.value = painting.category;
    editForm.elements.description.value = painting.description;
    if (editForm.elements.imageUrl) {
      editForm.elements.imageUrl.value = painting.imageUrl || "";
    }
    renderImageFormPreview(editForm, painting.imageUrl);

    return painting;
  } catch (error) {
    alert(error.message);
    window.location.href = "index.html";
    return null;
  }
}

function renderImageFormPreview(form, imageUrl) {
  const preview = form.querySelector("[data-image-preview]");

  if (!preview) {
    return;
  }

  if (!imageUrl) {
    preview.classList.remove("has-image");
    preview.innerHTML = "";
    return;
  }

  preview.classList.add("has-image");
  preview.innerHTML = `<img src="${escapeHtml(imageUrl)}" alt="">`;
}

function initImageInputs() {
  const forms = document.querySelectorAll("[data-form='painting']");

  forms.forEach((form) => {
    const imageUrlInput = form.elements.imageUrl;
    const imageFileInput = form.elements.imageFile;

    imageUrlInput?.addEventListener("input", () => {
      renderImageFormPreview(form, imageUrlInput.value.trim());
    });

    imageFileInput?.addEventListener("change", async () => {
      const file = imageFileInput.files[0];

      if (!file) {
        renderImageFormPreview(form, imageUrlInput?.value.trim());
        return;
      }

      try {
        const imageUrl = await readImageFile(file);
        renderImageFormPreview(form, imageUrl);
      } catch (error) {
        alert(error.message);
        imageFileInput.value = "";
      }
    });
  });
}

function initCategoryButtons() {
  const categoryButtons = document.querySelectorAll(".category-button");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderCatalog(button.dataset.category);
    });
  });
}

function initForms(currentPainting) {
  const forms = document.querySelectorAll("[data-form='painting']");

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector("button[type='submit']");
      const isEditForm = form.hasAttribute("data-edit-form");
      const id = getPaintingId();

      submitButton.disabled = true;
      submitButton.textContent = "Сохранение...";

      try {
        const payload = await getFormPayload(form, currentPainting);
        const url = isEditForm ? `${API_BASE_URL}/${id}` : API_BASE_URL;
        const method = isEditForm ? "PUT" : "POST";

        await requestJson(url, {
          method,
          body: JSON.stringify(payload)
        });

        window.location.href = "index.html";
      } catch (error) {
        alert(error.message);
        submitButton.disabled = false;
        submitButton.textContent = "Сохранить";
      }
    });
  });
}

function initDeleteButtons() {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action='delete']");

    if (!button) {
      return;
    }

    const id = Number(button.dataset.id);
    const painting = paintings.find((item) => item.id === id);
    const title = painting ? painting.title : "эту запись";

    if (!confirm(`Удалить "${title}"?`)) {
      return;
    }

    button.disabled = true;

    try {
      await requestJson(`${API_BASE_URL}/${id}`, {
        method: "DELETE"
      });

      paintings = paintings.filter((item) => item.id !== id);
      renderAdminList();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initCategoryButtons();
  initDeleteButtons();
  initImageInputs();
  await initCatalogPage();
  await initDetailsPage();
  await initAdminPage();
  const currentPainting = await initEditForm();
  initForms(currentPainting);
});
