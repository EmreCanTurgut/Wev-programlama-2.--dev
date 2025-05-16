const form = document.getElementById("noteForm");
const tableBody = document.getElementById("noteTableBody");
const fileInput = document.getElementById("fileInput");

let notes = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const data = new FormData(form);

  const entry = {
    ogrenciNo: data.get("ogrenciNo"),
    ders: data.get("ders"),
    not: parseFloat(data.get("not")),
  };

  notes.push(entry);
  renderTable();
  form.reset();
});

function renderTable() {
  tableBody.innerHTML = "";
  notes.forEach((note) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${note.ogrenciNo}</td>
      <td>${note.ders}</td>
      <td>${note.not}</td>
    `;
    tableBody.appendChild(row);
  });
}

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split("\n");

    for (let line of lines) {
      const [ogrenciNo, ders, notStr] = line.split(",");
      if (ogrenciNo && ders && notStr) {
        notes.push({
          ogrenciNo: ogrenciNo.trim(),
          ders: ders.trim(),
          not: parseFloat(notStr.trim()),
        });
      }
    }

    renderTable();
  };
  reader.readAsText(file);
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
