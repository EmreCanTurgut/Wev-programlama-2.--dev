// Token retrieval
token = localStorage.getItem('token');

// Element references
const noteForm = document.getElementById('noteForm');
const noteTableBody = document.getElementById('noteTableBody');
const fileInput = document.getElementById('fileInput');

// Grade API base
const gradesApiBase = 'http://127.0.0.1:5000/api/grades/grade';

// On load, fetch all grades
document.addEventListener('DOMContentLoaded', loadNotes);

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

function renderNotes(notes) {
    noteTableBody.innerHTML = '';
    notes.forEach((n) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${n.student_number || ''}</td>
      <td>${n.course_code || ''}</td>
      <td>${n.grade ?? ''}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteGrade('${
          n._id
      }')">Sil</button></td>
    `;
        noteTableBody.appendChild(tr);
    });
}

// Manual submission
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(noteForm);
    const payload = {
        student_number: fd.get('ogrenciNo'),
        course_code: fd.get('ders'),
        grade: parseFloat(fd.get('not')),
    };
    try {
        const res = await fetch(gradesApiBase, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg);
        noteForm.reset();
        loadNotes();
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
        const res = await fetch(`${gradesApiBase}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg);
        showSnackbar(`Yüklendi: ${data.successCount}`);
        console.log('Upload response:', data);
        loadNotes();
    } catch (err) {
        showSnackbar(err.message);
    }
});

// Delete
deleteGrade = async (id) => {
    if (!confirm('Emin misiniz?')) return;
    try {
        const res = await fetch(`${gradesApiBase}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg);
        loadNotes();
    } catch (err) {
        showSnackbar(err.message);
    }
};

function showSnackbar(message) {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = 'show';
    setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
    }, 3000);
}

function logout() {
    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
}

function ConfirimLogout() {
    localStorage.clear();
    window.location.href = '../../Login/index.html';
}
