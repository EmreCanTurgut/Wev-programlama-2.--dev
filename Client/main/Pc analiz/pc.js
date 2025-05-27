
const toggleBtn = document.getElementById('toggleButton');
const pcAciklamalar = document.getElementById('pc-aciklamalar');
const btnOgrenci = document.getElementById('btnOgrenci');
const btnDers = document.getElementById('btnDers');
const btnProgram = document.getElementById('btnProgram');
const resultContainer = document.getElementById('resultTableContainer');
const ctx = document.getElementById('pcChart').getContext('2d');
const token = localStorage.getItem('token');

// Basit snackbar
function showSnackbar(msg) {
    const sb = document.createElement('div');
    sb.className = 'snackbar show';
    sb.textContent = msg;
    document.body.appendChild(sb);
    setTimeout(() => {
        sb.classList.remove('show');
        sb.addEventListener('transitionend', () => sb.remove());
    }, 3000);
}


const pcChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: '', data: [] }] },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'PÇ Oranları' },
        },
        scales: { y: { beginAtZero: true, max: 100 } },
    },
});

toggleBtn.addEventListener('click', () => {
    pcAciklamalar.classList.toggle('hidden');
    toggleBtn.textContent = pcAciklamalar.classList.contains('hidden')
        ? '📘 PÇ Tanımlarını Göster'
        : '📕 PÇ Tanımlarını Gizle';
});


async function fetchAndRender(path, type, name) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/${path}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Veri alınamadı');

     
        if (!data.outcomes || !data.outcomes.length) {
            resultContainer.innerHTML = `<p class="text-center text-muted">Veri bulunamadı.</p>`;
            pcChart.data.labels = [];
            pcChart.data.datasets[0].data = [];
            pcChart.update();
            return;
        }

       
        let html = `<h3>${type}: ${name}</h3>
      <table class="table table-striped">
        <thead><tr><th>PÇ Kodu</th><th>Oran (%)</th></tr></thead>
        <tbody>
    `;
        data.outcomes.forEach((o) => {
            html += `<tr>
        <td>${o.outcome_code}</td>
        <td>${o.realization_rate.toFixed(1)}</td>
      </tr>`;
        });
        html += `</tbody></table>`;
        resultContainer.innerHTML = html;

        
        pcChart.data.labels = data.outcomes.map((o) => `PÇ${o.outcome_code}`);
        pcChart.data.datasets[0].data = data.outcomes.map(
            (o) => +o.realization_rate.toFixed(1)
        );
        pcChart.data.datasets[0].label = `${type}: ${name}`;
        pcChart.options.plugins.title.text = `${type} Bazlı PÇ Oranları`;
        pcChart.update();
    } catch (err) {
        showSnackbar(err.message);
    }
}


btnOgrenci.addEventListener('click', async () => {
    const sn = prompt('Öğrenci Numaranızı girin:');
    if (!sn) return;
    await fetchAndRender(
        `outcomes/realization/student/${encodeURIComponent(sn)}`,
        'Öğrenci',
        sn
    );
    setActiveButton(btnOgrenci);
});

btnDers.addEventListener('click', async () => {
    const cc = prompt('Ders Kodunu girin:');
    if (!cc) return;
    await fetchAndRender(
        `outcomes/realization/course/${encodeURIComponent(cc)}`,
        'Ders',
        cc
    );
    setActiveButton(btnDers);
});

btnProgram.addEventListener('click', async () => {
    await fetchAndRender(`outcomes/realization/summary`, 'Program', 'Tüm PÇ');
    setActiveButton(btnProgram);
});

// Buton stil yönetimi
function setActiveButton(btn) {
    [btnOgrenci, btnDers, btnProgram].forEach((b) =>
        b.classList.remove('active')
    );
    btn.classList.add('active');
}


btnProgram.click();




const userName = localStorage.getItem('user');
const usernameDisplay = document.getElementById('usernameDisplay');
if (usernameDisplay) usernameDisplay.textContent = userName || 'User';

function logout() {
    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
}

function ConfirimLogout() {
    localStorage.clear();
    window.location.href = '../../Login/index.html';
}