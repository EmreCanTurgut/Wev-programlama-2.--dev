const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
let students = [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const student = {
    first_name: formData.get("ad"),
    last_name: formData.get("soyad"),
    student_number: formData.get("ogrenciNo"),
    contact: formData.get("telefon"),
  };
  fetch
  //studenti PUSH la
  
  const response = await fetch(
    'http://127.0.0.1:5000/api/auth/register',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            first_name:student.first_name,
            last_name:student.last_name,
            student_number:student.student_number,
            contact:student.contact,
        }),
    }
);
p
const data = await response.json();
        console.log(data);

 // students.push(student);
  form.reset();
  renderTable();
});

students=[{"_id": "6826700fcc60ae844d6e3caf",
    "first_name": "admin",
    "last_name": "admin",
    "student_number": "1564",
    "contact": "156123"}]

    
renderTable();
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
        <td>${student.first_name}</td>
        <td>${student.last_name}</td>
        <td>${student.student_number}</td> 
        <td>${student.contact}</td>
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
