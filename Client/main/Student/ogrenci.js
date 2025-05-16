const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
let students = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const student = {
    ad: formData.get("ad"),
    soyad: formData.get("soyad"),
    ogrenciNo: formData.get("ogrenciNo"),
    email: formData.get("email"),
    telefon: formData.get("telefon"),
  };
  students.push(student);
  form.reset();
  renderTable();
});

function renderTable(filter = "") {
  tableBody.innerHTML = "";
  students
    .filter((s) => {
      const full = `${s.ad} ${s.soyad} ${s.ogrenciNo} ${s.email}`.toLowerCase();
      return full.includes(filter.toLowerCase());
    })
    .forEach((student, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.ad}</td>
        <td>${student.soyad}</td>
        <td>${student.ogrenciNo}</td>
        <td>${student.email}</td>
        <td>${student.telefon}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editStudent(${index})">Düzenle</button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent(${index})">Sil</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
}

function deleteStudent(index) {
  if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
    students.splice(index, 1);
    renderTable();
  }
}

function editStudent(index) {
  const student = students[index];
  const inputs = form.elements;
  inputs["ad"].value = student.ad;
  inputs["soyad"].value = student.soyad;
  inputs["ogrenciNo"].value = student.ogrenciNo;
  inputs["email"].value = student.email;
  inputs["telefon"].value = student.telefon;
  students.splice(index, 1);
  renderTable();
}

searchInput.addEventListener("input", (e) => {
  renderTable(e.target.value);
});

// userpanel

const userName = "emrecanturgut@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  const usernameDisplay = document.getElementById("usernameDisplay");
  if (usernameDisplay) {
    usernameDisplay.textContent = `${userName}`;
  }
});

function logout() {
  const modal = new bootstrap.Modal(document.getElementById("logoutModal"));
  modal.show();
}

function ConfirimLogout() {
  // Burada localStorage temizlenebilir veya oturum sonlandırılabilir
  window.location.href = "../../Login/index.html";
}
