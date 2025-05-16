function openSection(section) {
    switch (section) {
      case 'ogrenci':
        window.location.href = "ogrenci.html"; // Öğrenci sayfasına yönlendir
        break;
      case 'ders':
        window.location.href = "ders.html"; // Ders sayfasına yönlendir
        break;
      case 'not':
        window.location.href = "not.html"; // Not girişi sayfasına yönlendir
        break;
      default:
        alert("Bilinmeyen işlem");
    }
  }
  