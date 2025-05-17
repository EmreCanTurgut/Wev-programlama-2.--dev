// dersY.js
const form = document.getElementById('lessonForm');
// Destek için hem courseTableBody hem de eski studentTableBody id'lerini kontrol et
const tableBody =
    document.getElementById('courseTableBody') ||
    document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');

let courses = [];
let editingCourseCode = null;

// JWT ve API base
const token = localStorage.getItem('token');
const apiBase = 'http://127.0.0.1:5000/api/courses';

// Sayfa yüklendiğinde tüm dersleri çek
document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
});

async function loadCourses(filter = '') {
    try {
        if (!tableBody)
            throw new Error(
                'Tablo elementi bulunamadı: courseTableBody veya studentTableBody'
            );
        const url = filter
            ? `${apiBase}/?code=${encodeURIComponent(filter)}`
            : apiBase + '/';
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data.message || 'Dersler yüklenirken hata');
        courses = data;
        renderTable(filter);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function renderTable(filter = '') {
    tableBody.innerHTML = '';
    courses
        .filter((c) => {
            const full =
                `${c.name} ${c.code} ${c.credit} ${c.instructor}`.toLowerCase();
            return full.includes(filter.toLowerCase());
        })
        .forEach((course) => { 
            if(course.code ==null) return;
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${course.name}</td>
        <td>${course.code}</td>
        <td>${course.credit}</td>
        <td>${course.instructor}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="startEdit('${course.code}')">Düzenle</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course.code}')">Sil</button>
        </td>
      `;
            tableBody.appendChild(row);
        });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
        name: formData.get('ad'),
        code: formData.get('kod'),
        credit: parseInt(formData.get('kredi'), 10),
        instructor: formData.get('ogretimUyesi'),
    };
    try {
        let res;
        if (editingCourseCode) {
            res = await fetch(`${apiBase}/${editingCourseCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: payload.name,
                    credit: payload.credit,
                    instructor: payload.instructor,
                }),
            });
        } else {
            res = await fetch(apiBase + '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'API hatası');
        form.reset();
        editingCourseCode = null;
        loadCourses(searchInput.value);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});

async function deleteCourse(code) {
    if (!confirm('Bu dersi silmek istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`${apiBase}/${code}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }
        loadCourses(searchInput.value);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function startEdit(code) {
    const course = courses.find((c) => c.code === code);
    if (!course) return;
    form.elements['ad'].value = course.name;
    form.elements['kod'].value = course.code;
    form.elements['kredi'].value = course.credit;
    form.elements['ogretimUyesi'].value = course.instructor;
    editingCourseCode = course.code;
}

searchInput.addEventListener('input', (e) => renderTable(e.target.value));

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
