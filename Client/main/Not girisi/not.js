// not.js

// Token retrieval
const token = localStorage.getItem('token');

// Element references
const noteForm      = document.getElementById('noteForm');
const noteTableBody = document.getElementById('noteTableBody');
const fileInput     = document.getElementById('fileInput');
const snackbar      = document.getElementById('snackbar');

// Grade API base (dikkat: sonuna slash eklendi)
const gradesApiBase = 'http://127.0.0.1:5000/api/grades/grade/';

// On load, fetch all grades
document.addEventListener('DOMContentLoaded', loadNotes);

// Fetch and render grades
async function loadNotes() {
  try {
    const res = await fetch(gradesApiBase, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Notlar yüklenirken hata');
    renderNotes(data);
  } catch (err) {
    showSnackbar(err.message);
  }
}

// Render table rows
function renderNotes(notes) {
  noteTableBody.innerHTML = '';
  notes.forEach(n => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${n.student_number || ''}</td>
      <td>${n.course_code    || ''}</td>
      <td>${n.grade          ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteGrade('${n._id}')">
          Sil
        </button>
      </td>
    `;
    noteTableBody.appendChild(tr);
  });
}

// Manual submission
noteForm.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(noteForm);
  const payload = {
    student_number: fd.get('ogrenciNo').trim(),
    course_code:    fd.get('ders').trim(),
    grade:          parseFloat(fd.get('not')),
  };

  try {
    const res = await fetch(gradesApiBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Not eklenemedi');
    noteForm.reset();
    loadNotes();
    showSnackbar('Not başarıyla kaydedildi.');
  } catch (err) {
    showSnackbar(err.message);
  }
});

// CSV/Excel bulk upload
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${gradesApiBase}upload/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Yükleme hatası');
    showSnackbar(`Yüklendi: ${data.successCount}`);
    loadNotes();
  } catch (err) {
    showSnackbar(err.message);
  }
});

// Delete grade
window.deleteGrade = async id => {
  if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch(`${gradesApiBase}${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Silme hatası');
    loadNotes();
    showSnackbar('Not silindi.');
  } catch (err) {
    showSnackbar(err.message);
  }
};

// Snackbar gösterimi
function showSnackbar(message) {
  snackbar.textContent = message;
  snackbar.classList.add('show');
  setTimeout(() => snackbar.classList.remove('show'), 3000);
}

// Logout işlemleri (değişmedi)
function logout() {
  const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
  modal.show();
}
function ConfirimLogout() {
  localStorage.clear();
  window.location.href = '../../Login/index.html';
}
