const form = document.getElementById('lessonForm');
const tableBody = document.getElementById('lessonTableBody');
const searchInput = document.getElementById('searchLesson');

let lessons = [];

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const data = new FormData(form);
  const lesson = {
    id: Date.now(),
    ad: data.get('ad'),
    kod: data.get('kod'),
    kredi: data.get('kredi'),
    ogretimUyesi: data.get('ogretimUyesi')
  };

  lessons.push(lesson);
  form.reset();
  renderLessons();
});

function renderLessons(filter = '') {
  tableBody.innerHTML = '';
  lessons
    .filter(l => l.ad.toLowerCase().includes(filter.toLowerCase()) || l.kod.toLowerCase().includes(filter.toLowerCase()))
    .forEach(lesson => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input class="form-control form-control-sm" value="${lesson.ad}" onchange="updateLesson(${lesson.id}, 'ad', this.value)"></td>
        <td><input class="form-control form-control-sm" value="${lesson.kod}" onchange="updateLesson(${lesson.id}, 'kod', this.value)"></td>
        <td><input class="form-control form-control-sm" type="number" value="${lesson.kredi}" onchange="updateLesson(${lesson.id}, 'kredi', this.value)"></td>
        <td><input class="form-control form-control-sm" value="${lesson.ogretimUyesi}" onchange="updateLesson(${lesson.id}, 'ogretimUyesi', this.value)"></td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteLesson(${lesson.id})"><i class="bi bi-trash"></i></button></td>
      `;
      tableBody.appendChild(row);
    });
}

function updateLesson(id, key, value) {
  const lesson = lessons.find(l => l.id === id);
  if (lesson) lesson[key] = value;
}

function deleteLesson(id) {
  const yetkili = confirm("Ders kaydını silmek istediğinize emin misiniz?");
  if (yetkili) {
    lessons = lessons.filter(l => l.id !== id);
    renderLessons(searchInput.value);
  }
}

searchInput.addEventListener('input', function() {
  renderLessons(this.value);
});
