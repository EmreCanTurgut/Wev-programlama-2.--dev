const form = document.getElementById("lessonForm");
const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");

let lessons = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const lesson = {
    ad: formData.get("ad"),
    kod: formData.get("kod"),
    kredi: formData.get("kredi"),
    ogretimUyesi: formData.get("ogretimUyesi")
  };
  lessons.push(lesson);
  form.reset();
  renderTable();
});

function renderTable(filter = "") {
  tableBody.innerHTML = "";
  lessons
    .filter((l) => {
      const full = `${l.ad} ${l.kod} ${l.kredi} ${l.ogretimUyesi}`.toLowerCase();
      return full.includes(filter.toLowerCase());
    })
    .forEach((lesson, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${lesson.ad}</td>
        <td>${lesson.kod}</td>
        <td>${lesson.kredi}</td>
        <td>${lesson.ogretimUyesi}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editLesson(${index})">Düzenle</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLesson(${index})">Sil</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
}

function deleteLesson(index) {
  if (confirm("Bu dersi silmek istediğinize emin misiniz?")) {
    lessons.splice(index, 1);
    renderTable();
  }
}

function editLesson(index) {
  const lesson = lessons[index];
  const inputs = form.elements;
  inputs["ad"].value = lesson.ad;
  inputs["kod"].value = lesson.kod;
  inputs["kredi"].value = lesson.kredi;
  inputs["ogretimUyesi"].value = lesson.ogretimUyesi;
  lessons.splice(index, 1);
  renderTable();
}

searchInput.addEventListener("input", (e) => {
  renderTable(e.target.value);
});
