// ogrenci.js
const form = document.getElementById('studentForm');
const tableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');

let students = [];
let editingStudentNumber = null;

// Get JWT from localStorage (assumes user logged in and token stored)
const token = localStorage.getItem('token');
const apiBase = 'http://127.0.0.1:5000/api/students/';

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
});

// Fetch all students
async function loadStudents(filter = '') {
    try {
        const url = filter
            ? `${apiBase}/?student_number=${encodeURIComponent(filter)}`
            : apiBase;
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error fetching students');
        students = data;
        renderTable(filter);
    } catch (err) {
        console.error(err);
        alert('Öğrenciler yüklenirken bir hata oluştu.');
    }
}

// Render table rows
function renderTable(filter = '') {
    tableBody.innerHTML = '';
    students
        .filter((s) => {
            const full =
                `${s.first_name} ${s.last_name} ${s.student_number} ${s.contact}`.toLowerCase();
            return full.includes(filter.toLowerCase());
        })
        .forEach((student) => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${student.first_name}</td>
        <td>${student.last_name}</td>
        <td>${student.student_number}</td>
        <td>${student.contact}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="startEdit('${student.student_number}')">Düzenle</button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.student_number}')">Sil</button>
        </td>
      `;
            tableBody.appendChild(row);
        });
}

// Create or update student on form submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
        first_name: formData.get('ad'),
        last_name: formData.get('soyad'),
        student_number: formData.get('ogrenciNo'),
        contact: formData.get('telefon'),
    };

    try {
        let res;
        if (editingStudentNumber) {
            // Update
            res = await fetch(`${apiBase}${editingStudentNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    contact: payload.contact,
                }),
            });
        } else {
            // Create
            res = await fetch(apiBase , {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'API error');

        // Reset form and state
        form.reset();
        editingStudentNumber = null;

        // Reload list
        loadStudents(searchInput.value);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});

// Delete student
async function deleteStudent(studentNumber) {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`${apiBase}${studentNumber}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }
        loadStudents(searchInput.value);
    } catch (err) {
        console.error(err);
        alert(err.message || 'Silme işlemi başarısız');
    }
}

// Start editing
function startEdit(studentNumber) {
    const student = students.find((s) => s.student_number === studentNumber);
    if (!student) return;
    form.elements['ad'].value = student.first_name;
    form.elements['soyad'].value = student.last_name;
    form.elements['ogrenciNo'].value = student.student_number;
    form.elements['telefon'].value = student.contact;

    editingStudentNumber = student.student_number;
}

// Search filter
searchInput.addEventListener('input', (e) => {
    renderTable(e.target.value);
});

// Userpanel (username display & logout)
const userName = localStorage.getItem('user');
const usernameDisplay = document.getElementById('usernameDisplay');
if (usernameDisplay) usernameDisplay.textContent = userName || 'User';

function logout() {
    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
}

function ConfirimLogout() {
    localStorage.clear();
    window.location.href = '../../Login/index.html';
}
