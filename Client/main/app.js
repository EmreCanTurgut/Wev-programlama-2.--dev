function openSection(section) {
  switch (section) {
    case "ogrenci":
      window.location.href = "./Student/ogrenci.html"; 
      break;
    case "ders":
      window.location.href = "./Ders Yonetimi/dersY.html"; 
      break;
    case "not":
      window.location.href = "./Not girisi/not.html"; 
      break;
    case "pc":
      window.location.href = "./Pc analiz/pc.html"; 
      break;
    default:
      alert("Bilinmeyen işlem");
  }
}

const userName = localStorage.getItem("user");

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
  localStorage.clear();
  window.location.href = "../Login/index.html";
}
