// pc.js

// Element referansları
const toggleBtn = document.getElementById('toggleButton');
const pcAciklamalar = document.getElementById('pc-aciklamalar');
const btnOgrenci = document.getElementById('btnOgrenci');
const btnDers = document.getElementById('btnDers');
const btnProgram = document.getElementById('btnProgram');
const resultContainer = document.getElementById('resultTableContainer');
const ctx = document.getElementById('pcChart').getContext('2d');
const token = localStorage.getItem('token');

// Chart.js başlangıç (boş veri)
const pcChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: '',
                data: [],
                backgroundColor: 'rgba(0, 123, 255, 0.7)',
                borderColor: 'rgba(0, 86, 179, 1)',
                borderRadius: 5,
                borderWidth: 1,
            },
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Program Çıktısı Gerçekleşme Oranları',
            },
        },
        scales: {
            y: { beginAtZero: true, max: 100 },
        },
    },
});

// PÇ tanımlamalarını göster/gizle
toggleBtn.addEventListener('click', () => {
    pcAciklamalar.classList.toggle('hidden');
    toggleBtn.textContent = pcAciklamalar.classList.contains('hidden')
        ? '📘 PÇ Tanımlarını Göster'
        : '📕 PÇ Tanımlarını Gizle';
});

// Buton tıklamaları
btnOgrenci.addEventListener('click', async () => {
    const studentNo = prompt('Öğrenci Numaranızı girin:');
    if (!studentNo) return;
    await fetchAndRender(
        `outcomes/realization/student/${encodeURIComponent(studentNo)}`,
        'Öğrenci',
        studentNo
    );
    setActiveButton(btnOgrenci);
});

btnDers.addEventListener('click', async () => {
    const courseCode = prompt('Ders Kodunu girin:');
    if (!courseCode) return;
    await fetchAndRender(
        `outcomes/realization/course/${encodeURIComponent(courseCode)}`,
        'Ders',
        courseCode
    );
    setActiveButton(btnDers);
});

btnProgram.addEventListener('click', async () => {
    await fetchAndRender(
        `outcomes/realization/program`,
        'Program',
        'Tüm Program'
    );
    setActiveButton(btnProgram);
});

// Veri çekme ve render
async function fetchAndRender(path, type, name) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/${path}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Veri alınamadı');
        renderTable(data.outcomes, type, name);
        renderChart(data.outcomes, type, name);
    } catch (err) {
        alert(err.message);
    }
}

// Tablo render
function renderTable(outcomes, type, name) {
    let html = `<h3>${type}: ${name}</h3>`;
    html +=
        `<table class="table table-striped"><thead><tr>` +
        `<th>PÇ Kodu</th><th>Oran (%)</th></tr></thead><tbody>`;

    outcomes.forEach((o) => {
        html +=
            `<tr><td>${o.outcome_code}</td>` +
            `<td>${o.realization_rate.toFixed(1)}</td></tr>`;
    });

    html += `</tbody></table>`;
    resultContainer.innerHTML = html;
}

// Grafik render
function renderChart(outcomes, type, name) {
    pcChart.data.labels = outcomes.map((o) => `PÇ${o.outcome_code}`);
    pcChart.data.datasets[0].data = outcomes.map((o) =>
        o.realization_rate.toFixed(1)
    );
    pcChart.data.datasets[0].label = `${type}: ${name}`;
    pcChart.options.plugins.title.text = `${type} Bazlı PÇ Gerçekleme Oranları`;
    pcChart.update();
}

// Aktif buton stili
function setActiveButton(activeBtn) {
    [btnOgrenci, btnDers, btnProgram].forEach((btn) =>
        btn.classList.remove('active')
    );
    activeBtn.classList.add('active');
}

// Sayfa ilk açıldığında program bazlı raporu göster
btnProgram.click();
