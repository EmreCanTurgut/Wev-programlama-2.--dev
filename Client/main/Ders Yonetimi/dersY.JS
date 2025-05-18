const form = document.getElementById('lessonForm');
const tableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const token = localStorage.getItem('token');
const apiBase = 'http://127.0.0.1:5000/api/courses';

let courses = [];
let editingCourseCode = null;

document.addEventListener('DOMContentLoaded', () => loadCourses());

async function loadCourses(filter = '') {
    try {
        const url = filter
            ? `${apiBase}/?code=${encodeURIComponent(filter)}`
            : apiBase + '/';
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Dersler yüklenirken hata.');
        courses = data;
        renderTable(filter);
    } catch (err) {
        showSnackbar(err.message);
    }
}

function renderTable(filter = '') {
    tableBody.innerHTML = '';
    courses
        .filter((c) =>
            `${c.name} ${c.code} ${c.credit} ${c.instructor}`
                .toLowerCase()
                .includes(filter.toLowerCase())
        )
        .forEach((course) => {
            if (!course.code) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${course.name}</td>
        <td>${course.code}</td>
        <td>${course.credit}</td>
        <td>${course.instructor}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="startEdit('${course.code}')">Düzenle</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course.code}')">Sil</button>
        </td>
      `;
            tableBody.appendChild(tr);
        });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    // Temel ders nesnesi
    const payload = {
        name: fd.get('ad'),
        code: fd.get('kod'),
        credit: parseInt(fd.get('kredi'), 10),
        instructor: fd.get('ogretimUyesi'),
    };
    // Çıktı kodları alanını işle
    const ocStr = fd.get('outcomes')?.trim();
    if (ocStr) {
        const list = ocStr
            .split(',')
            .map((s) => s.trim())
            .filter((s) => /^\d+$/.test(s))
            .map(Number);
        if (list.length) payload.outcomes = list;
    }

    try {
        let res;
        if (editingCourseCode) {
            res = await fetch(`${apiBase}/${editingCourseCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
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
        if (!res.ok) throw new Error(data.msg || 'API hatası');
        showSnackbar('Ders başarıyla kaydedildi.');
        form.reset();
        editingCourseCode = null;
        loadCourses(searchInput.value);
    } catch (err) {
        showSnackbar(err.message);
    }
});

async function deleteCourse(code) {
    if (!confirm('Bu dersi silmek istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`${apiBase}/${code}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg);
        showSnackbar('Ders silindi.');
        loadCourses(searchInput.value);
    } catch (err) {
        showSnackbar(err.message);
    }
}

function startEdit(code) {
    const course = courses.find((c) => c.code === code);
    if (!course) return;
    form.elements['ad'].value = course.name;
    form.elements['kod'].value = course.code;
    form.elements['kredi'].value = course.credit;
    form.elements['ogretimUyesi'].value = course.instructor;
    // Not: outcomes back‑fill için ek kod yazılabilir
    editingCourseCode = code;
}

searchInput.addEventListener('input', (e) => renderTable(e.target.value));

function logout() {
    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
}
function ConfirimLogout() {
    localStorage.clear();
    window.location.href = '../../Login/index.html';
}

// Basit snackbar gösterimi
function showSnackbar(msg) {
    let sb = document.getElementById('snackbar');
    if (!sb) {
        sb = document.createElement('div');
        sb.id = 'snackbar';
        document.body.appendChild(sb);
    }
    sb.textContent = msg;
    sb.classList.add('show');
    setTimeout(() => sb.classList.remove('show'), 3000);
}
