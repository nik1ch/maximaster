document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("[data-form='painting']");
  const deleteButtons = document.querySelectorAll("[data-action='delete']");
  const categoryButtons = document.querySelectorAll(".category-button");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Это HTML-прототип. Сохранение данных будет добавлено позже.");
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("Это HTML-прототип. Удаление данных будет добавлено позже.");
    });
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
});
