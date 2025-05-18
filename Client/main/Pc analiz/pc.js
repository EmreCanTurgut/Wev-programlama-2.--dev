// --- PÇ Tanımlarını Göster/Gizle ---
const toggleBtn = document.getElementById("toggleButton");
const pcAciklamalar = document.getElementById("pc-aciklamalar");

toggleBtn.addEventListener("click", () => {
  const isVisible = !pcAciklamalar.classList.contains("hidden");
  pcAciklamalar.classList.toggle("hidden");
  toggleBtn.textContent = isVisible
    ? "📘 PÇ Tanımlarını Göster"
    : "📕 PÇ Tanımlarını Gizle";
});

// --- Chart.js Grafik Ayarları ---
const ctx = document.getElementById("pcChart").getContext("2d");

const genelOrtalama = [80, 75, 90, 60, 70, 85, 78, 88, 92, 67, 80, 74];

const chartData = {
  labels: Array.from({ length: 12 }, (_, i) => `PÇ${i + 1}`),
  datasets: [{
    label: "Genel PÇ Gerçekleşme Oranı",
    data: genelOrtalama,
    backgroundColor: "rgba(0, 123, 255, 0.7)",
    borderColor: "rgba(0, 86, 179, 1)",
    borderRadius:5,
    borderWidth: 1,
  }]
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: {
      display: true,
      text: "Program Çıktısı Gerçekleşme Oranları"
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
};

let pcChart = new Chart(ctx, {
  type: "bar",
  data: chartData,
  options: chartOptions
});

// --- Dummy Veriler ---

const dummyOgrenciler = [
  { ad: "Ahmet Yılmaz", pc: [80, 75, 90, 60, 70, 85, 78, 88, 92, 67, 80, 74] },
  { ad: "Zeynep Kara", pc: [85, 80, 88, 75, 90, 82, 79, 91, 93, 70, 77, 85] },
  { ad: "Mert Özkan", pc: [70, 60, 72, 65, 68, 74, 80, 78, 85, 69, 72, 71] }
];

const dummyDersler = [
  { ad: "Matematik I", pc: [75, 70, 80, 60, 65, 78, 70, 85, 90, 60, 75, 70] },
  { ad: "Fizik II", pc: [80, 75, 85, 70, 72, 80, 75, 88, 85, 68, 79, 74] },
  { ad: "Programlama", pc: [85, 80, 90, 75, 80, 85, 83, 90, 92, 75, 85, 80] }
];

const dummyProgramlar = [
  { ad: "Bilgisayar Mühendisliği", pc: [78, 74, 88, 70, 72, 82, 76, 85, 90, 68, 80, 75] },
  { ad: "Elektrik-Elektronik Müh.", pc: [70, 68, 78, 65, 70, 75, 70, 80, 85, 60, 72, 68] },
  { ad: "Makine Mühendisliği", pc: [65, 60, 75, 60, 65, 70, 68, 75, 80, 58, 70, 65] }
];

// --- Butonlar ---
const btnOgrenci = document.getElementById("btnOgrenci");
const btnDers = document.getElementById("btnDers");
const btnProgram = document.getElementById("btnProgram");

const resultContainer = document.getElementById("resultTableContainer");

// Başlangıçta öğrenci tablosu göster
renderPCTablosu(dummyOgrenciler, "Öğrenci");

// Butonlara tıklayınca tablo ve grafik güncellensin
btnOgrenci.addEventListener("click", () => {
  renderPCTablosu(dummyOgrenciler, "Öğrenci");
});

btnDers.addEventListener("click", () => {
  renderPCTablosu(dummyDersler, "Ders");
});

btnProgram.addEventListener("click", () => {
  renderPCTablosu(dummyProgramlar, "Program");
});

function renderPCTablosu(data, tip) {
    let html = `<table>
      <thead>
        <tr><th>${tip} Adı</th>`;
    for (let i = 1; i <= 12; i++) {
      html += `<th>PÇ${i}</th>`;
    }
    html += `</tr></thead><tbody>`;
  
    data.forEach((item, index) => {
      html += `<tr data-index="${index}" class="pc-row">
                 <td>${item.ad}</td>`;
      item.pc.forEach(puan => {
        html += `<td>${puan}%</td>`;
      });
      html += `</tr>`;
    });
  
    html += `</tbody></table>`;
    resultContainer.innerHTML = html;
  
    // Satırlara tıklama olayı ekle
    const rows = document.querySelectorAll("#resultTableContainer .pc-row");
    rows.forEach(row => {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => {
        // 1) Tüm satırlardan 'selected' sınıfını kaldır
        rows.forEach(r => r.classList.remove('selected'));
  
        // 2) Tıklanan satıra 'selected' sınıfını ekle
        row.classList.add('selected');
  
        // 3) Grafiği güncelle
        const idx = row.getAttribute("data-index");
        updateChartWithData(data[idx], tip);
      });
    });
  
    // Tablo render edildikten sonra grafiği genel ortalama olarak sıfırla
    pcChart.data.datasets[0].data = genelOrtalama;
    pcChart.data.datasets[0].label = "Genel PÇ Gerçekleşme Oranı";
    pcChart.options.plugins.title.text = "Program Çıktısı Gerçekleşme Oranları";
    pcChart.update();
  }
  

// --- Grafiği Güncelle ---
function updateChartWithData(item, tip) {
  pcChart.data.datasets[0].data = item.pc;
  pcChart.data.datasets[0].label = `${item.ad} - PÇ Gerçekleşme Oranı`;
  pcChart.options.plugins.title.text = `${item.ad} (${tip}) Program Çıktısı Gerçekleşme Oranları`;
  pcChart.update();
}


//buton basılması
function setActiveButton(activeBtn) {
    [btnOgrenci, btnDers, btnProgram].forEach(btn => {
      btn.classList.remove("active");   
    });
    activeBtn.classList.add("active");
  }
  
  btnOgrenci.addEventListener("click", () => {
    renderPCTablosu(dummyOgrenciler, "Öğrenci");
    setActiveButton(btnOgrenci);
  });
  
  btnDers.addEventListener("click", () => {
    renderPCTablosu(dummyDersler, "Ders");
    setActiveButton(btnDers);
  });
  
  btnProgram.addEventListener("click", () => {
    renderPCTablosu(dummyProgramlar, "Program");
    setActiveButton(btnProgram);
  });
  
  // Sayfa yüklendiğinde ilk aktif butonu ayarla
  setActiveButton(btnOgrenci);

const allrows =document.querySelectorAll(".pc-row")
console.log(allrows)
allrows.forEach((e)=>{e.addEventListener("click",()=>{
    e.classList.remove

})})
