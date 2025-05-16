function openSection(section) {
    switch (section) {
      case 'ogrenci':
        window.location.href = "./Student/ogrenci.html"; // Öğrenci sayfasına yönlendir
        break;
      case 'ders':
        window.location.href = "./Ders Yonetimi/dersY.html"; // Ders sayfasına yönlendir
        break;
      case 'not':
        window.location.href = "./Not girisi/not.html"; // Not girişi sayfasına yönlendir
        break;
      default:
        alert("Bilinmeyen işlem");
    }
  }
  