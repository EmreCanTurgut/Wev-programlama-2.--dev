function openSection(section) {
  switch (section) {
    case "ogrenci":
      window.location.href = "./Student/ogrenci.html"; // Öğrenci sayfasına yönlendir
      break;
    case "ders":
      window.location.href = "./Ders Yonetimi/dersY.html"; // Ders sayfasına yönlendir
      break;
    case "not":
      window.location.href = "./Not girisi/not.html"; // Not girişi sayfasına yönlendir
      break;
    default:
      alert("Bilinmeyen işlem");
  }
}

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
  window.location.href = "../Login/index.html";
}
