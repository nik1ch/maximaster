const paintings = [
  {
    id: 1,
    title: "Звездная ночь",
    artist: "Винсент ван Гог",
    year: 1889,
    category: "Пейзажи",
    previewClass: "preview-blue",
    description: "Одна из самых известных работ ван Гога с выразительным ночным небом и движением цвета."
  },
  {
    id: 2,
    title: "Утро в сосновом лесу",
    artist: "Иван Шишкин",
    year: 1889,
    category: "Пейзажи",
    previewClass: "preview-green",
    description: "Пейзаж с густым лесом и мягким утренним светом, знакомый по спокойной природной сцене."
  },
  {
    id: 3,
    title: "Девушка с жемчужной сережкой",
    artist: "Ян Вермеер",
    year: 1665,
    category: "Портреты",
    previewClass: "preview-gold",
    description: "Камерный портрет с ясным взглядом, темным фоном и световым акцентом на лице модели."
  },
  {
    id: 4,
    title: "Корзина с яблоками",
    artist: "Поль Сезанн",
    year: 1895,
    category: "Натюрморты",
    previewClass: "preview-rose",
    description: "Натюрморт с фруктами и посудой, где форма предметов важнее буквальной точности."
  },
  {
    id: 5,
    title: "Девятый вал",
    artist: "Иван Айвазовский",
    year: 1850,
    category: "Морские виды",
    previewClass: "preview-sea",
    description: "Драматическая морская сцена после шторма с ярким светом и напряженной композицией."
  }
];

const getPaintingId = () => {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
};

const findPainting = (id) => paintings.find((painting) => painting.id === id);

const renderCatalog = (category = "Все") => {
  const catalogList = document.querySelector("[data-catalog-list]");

  if (!catalogList) {
    return;
  }

  const filteredPaintings = category === "Все"
    ? paintings
    : paintings.filter((painting) => painting.category === category);

  if (filteredPaintings.length === 0) {
    catalogList.innerHTML = '<p class="empty-state">В этой категории пока нет картин.</p>';
    return;
  }

  catalogList.innerHTML = filteredPaintings.map((painting) => `
    <article class="painting-card">
      <div class="painting-preview ${painting.previewClass}"></div>
      <div class="painting-info">
        <h3>${painting.title}</h3>
        <p>${painting.artist}, ${painting.year}</p>
        <div class="painting-meta">
          <span class="tag">${painting.category}</span>
        </div>
        <div class="actions">
          <a href="details.html?id=${painting.id}">Подробнее</a>
        </div>
      </div>
    </article>
  `).join("");
};

const renderDetails = () => {
  const details = document.querySelector("[data-details]");

  if (!details) {
    return;
  }

  const title = document.querySelector("[data-details-title]");
  const painting = findPainting(getPaintingId()) || paintings[0];

  document.title = painting.title;
  title.textContent = painting.title;

  details.innerHTML = `
    <div class="painting-preview large ${painting.previewClass}"></div>
    <dl>
      <div>
        <dt>Автор</dt>
        <dd>${painting.artist}</dd>
      </div>
      <div>
        <dt>Год</dt>
        <dd>${painting.year}</dd>
      </div>
      <div>
        <dt>Категория</dt>
        <dd>${painting.category}</dd>
      </div>
      <div>
        <dt>Описание</dt>
        <dd>${painting.description}</dd>
      </div>
    </dl>
    <div class="form-actions">
      <a class="button secondary" href="index.html">Назад</a>
    </div>
  `;
};

const renderAdminList = () => {
  const adminList = document.querySelector("[data-admin-list]");

  if (!adminList) {
    return;
  }

  adminList.innerHTML = paintings.map((painting) => `
    <tr>
      <td>${painting.title}</td>
      <td>${painting.artist}</td>
      <td>${painting.year}</td>
      <td>${painting.category}</td>
      <td class="actions">
        <a href="../details.html?id=${painting.id}">Просмотр</a>
        <a href="edit.html?id=${painting.id}">Изменить</a>
        <button type="button" data-action="delete" data-id="${painting.id}">Удалить</button>
      </td>
    </tr>
  `).join("");
};

const fillEditForm = () => {
  const editForm = document.querySelector("[data-edit-form]");

  if (!editForm) {
    return;
  }

  const painting = findPainting(getPaintingId()) || paintings[0];

  editForm.elements.title.value = painting.title;
  editForm.elements.artist.value = painting.artist;
  editForm.elements.year.value = painting.year;
  editForm.elements.category.value = painting.category;
  editForm.elements.description.value = painting.description;
};

const initCategoryButtons = () => {
  const categoryButtons = document.querySelectorAll(".category-button");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderCatalog(button.dataset.category);
    });
  });
};

const initForms = () => {
  const forms = document.querySelectorAll("[data-form='painting']");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = Object.fromEntries(new FormData(form));
      console.log("Данные формы:", formData);
      alert("Данные формы собраны в JS. Сохранение через API будет добавлено позже.");
    });
  });
};

const initDeleteButtons = () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='delete']");

    if (!button) {
      return;
    }

    const painting = findPainting(Number(button.dataset.id));
    const title = painting ? painting.title : "эту запись";
    alert(`Удаление "${title}" будет подключено после добавления API.`);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  renderDetails();
  renderAdminList();
  fillEditForm();
  initCategoryButtons();
  initForms();
  initDeleteButtons();
});
