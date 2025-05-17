// not.js
// Token retrieval
const token = localStorage.getItem('token');

// Element references
const noteForm = document.getElementById('noteForm');
const noteTableBody = document.getElementById('noteTableBody');
const fileInput = document.getElementById('fileInput');

// Grade API base
const gradesApiBase = 'http://127.0.0.1:5000/api/grades/grade';

// Ensure form and table exist
if (!noteForm || !noteTableBody || !fileInput) {
    console.error('Required element(s) missing in not.js');
}

let notes = [];

// On load, fetch all grades
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});

// Fetch and render grades
async function loadNotes() {
    try {
        const res = await fetch(gradesApiBase, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Notlar yüklenirken hata');
        notes = data;
        renderNotes();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function renderNotes() {
    noteTableBody.innerHTML = '';
    notes.forEach((n) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${n.student_number}</td>
      <td>${n.course_code}</td>
      <td>${n.grade}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteGrade('${n._id}')">Sil</button></td>
    `;
        noteTableBody.appendChild(tr);
    });
}

// Handle manual grade submission
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(noteForm);
        const payload = {
            student_number: formData.get('ogrenciNo'),
            course_code: formData.get('ders'),
            grade: parseFloat(formData.get('not')),
        };
        const res = await fetch(gradesApiBase, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if(data.msg !== "Grade added"){
            alert(data.msg);
            return;
        }
        noteForm.reset();
        loadNotes();
    } catch (err) {
        console.error(err);
        alert(data.msg);
    }
});

// Handle CSV/Excel bulk upload
fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${gradesApiBase}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Yükleme hatası');
        alert(
            `Yükleme tamamlandı:\nBaşarılı: ${data.successCount}\nHatalı: ${data.errorCount}`
        );
        loadNotes();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});

// Delete grade function
window.deleteGrade = async (id) => {
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`${gradesApiBase}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Silme hatası');
        }
        loadNotes();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};
