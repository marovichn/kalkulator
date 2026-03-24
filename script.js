let mojGrafik = null;

document.getElementById('dugmeResi').addEventListener('click', function() {
    // Preuzimanje vrednosti sa ekrana
    const a = parseFloat(document.getElementById('koef_a').value);
    const b = parseFloat(document.getElementById('koef_b').value);
    const c = parseFloat(document.getElementById('koef_c').value);

    // Provera validnosti unosa
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        alert("Molimo unesite ispravne koeficijente.");
        return;
    }
    if (a === 0) {
        alert("Koeficijent 'a' ne može biti nula kod kvadratne jednačine.");
        return;
    }

    // ANALITIČKO REŠAVANJE (Kvadratna formula)
    const diskriminanta = b * b - 4 * a * c;
    let tekstRezultata = "";
    let resenje1 = null, resenje2 = null;

    if (diskriminanta > 0) {
        resenje1 = (-b + Math.sqrt(diskriminanta)) / (2 * a);
        resenje2 = (-b - Math.sqrt(diskriminanta)) / (2 * a);
        tekstRezultata = `<strong>Diskriminanta D = ${diskriminanta}</strong><br>
                        Postoje dva realna rešenja:<br>
                        x₁ = <b>${resenje1.toFixed(4)}</b><br>
                        x₂ = <b>${resenje2.toFixed(4)}</b>`;
    } else if (diskriminanta === 0) {
        resenje1 = -b / (2 * a);
        resenje2 = resenje1;
        tekstRezultata = `<strong>Diskriminanta D = 0</strong><br>
                        Postoji jedno dvostruko rešenje:<br>
                        x = <b>${resenje1.toFixed(4)}</b>`;
    } else {
        const realniDeo = (-b / (2 * a)).toFixed(4);
        const imaginarniDeo = (Math.sqrt(Math.abs(diskriminanta)) / (2 * a)).toFixed(4);
        tekstRezultata = `<strong>Diskriminanta D = ${diskriminanta}</strong><br>
                        Rešenja su kompleksna:<br>
                        x₁ = <b>${realniDeo} + ${imaginarniDeo}i</b><br>
                        x₂ = <b>${realniDeo} - ${imaginarniDeo}i</b>`;
    }

    // Prikaz rezultata u HTML-u
    document.getElementById('mat-info').innerHTML = tekstRezultata;
    document.getElementById('rezultati').classList.remove('skriveno');

    // CRTANJE GRAFIKA
    const temeX = -b / (2 * a); // Centriramo grafik oko x-koordinate temena
    nacrtajGrafik(a, b, c, temeX, resenje1, resenje2, diskriminanta);
});

function nacrtajGrafik(a, b, c, centarX, r1, r2, D) {
    const platno = document.getElementById('grafikFunkcije').getContext('2d');
    const xVrednosti = [];
    const yVrednosti = [];
    const opseg = 5; 
    const korak = 0.1;

    // Generisanje tačaka za parabolu
    for (let trenutniX = centarX - opseg; trenutniX <= centarX + opseg; trenutniX += korak) {
        xVrednosti.push(trenutniX);
        yVrednosti.push(a * trenutniX * trenutniX + b * trenutniX + c);
    }

    // Uništi stari grafik ako postoji
    if (mojGrafik) {
        mojGrafik.destroy();
    }

    // Priprema tačaka za nule (samo ako su realne)
    const tackeNula = [];
    if (D >= 0 && r1 !== null) tackeNula.push({ x: r1, y: 0 });
    if (D > 0 && r2 !== null) tackeNula.push({ x: r2, y: 0 });

    // Kreiranje novog grafikona pomoću Chart.js
    mojGrafik = new Chart(platno, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'f(x) = ax² + bx + c',
                    data: yVrednosti.map((y, i) => ({ x: xVrednosti[i], y: y })),
                    borderColor: D < 0 ? '#ef4444' : '#2563eb',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.2
                },
                {
                    label: 'Nule funkcije',
                    data: tackeNula,
                    backgroundColor: '#10b981',
                    pointRadius: 7,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', position: 'bottom' },
                y: { grid: { color: 'rgba(0,0,0,0.05)' } }
            }
        }
    });
}